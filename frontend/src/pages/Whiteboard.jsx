import { useRef, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { connectSocket, getSocket, disconnectSocket } from '../services/socket'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import './Whiteboard.css'

const Whiteboard = () => {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    // Get username from user object
    const USERNAME = user?.name || user?.username || 'Anonymous'
    const MY_USER_ID = user?.id || user?.email || 'anonymous'
    const ROOM_ID = roomId || 'default-room'

    const canvasRef = useRef(null)
    const imageInputRef = useRef(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState('#000000')
    const [brushSize, setBrushSize] = useState(3)
    const [canvasData, setCanvasData] = useState([])
    const { theme, toggleTheme } = useTheme()

    // Chat state
    const [chatMessages, setChatMessages] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'users'
    const [isChatOpen, setIsChatOpen] = useState(true)
    const chatEndRef = useRef(null)

    // Presence state
    const [onlineUsers, setOnlineUsers] = useState([])
    const [myRole, setMyRole] = useState(null)
    const [selectedImageId, setSelectedImageId] = useState(null)
    const [activeTool, setActiveTool] = useState('pencil')
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showPencilSize, setShowPencilSize] = useState(false)
    const [showEraserSize, setShowEraserSize] = useState(false)
    const [pencilSize, setPencilSize] = useState(3)
    const [eraserSize, setEraserSize] = useState(20)

    // Refs for dropdown positioning
    const pencilSizeRef = useRef(null)
    const eraserSizeRef = useRef(null)
    const colorPickerRef = useRef(null)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0 })

    // Drawing refs
    const currentStroke = useRef([])
    const isDrawingRef = useRef(false)
    const prevPos = useRef(null)

    // Image refs
    const imagesRef = useRef([])
    const canvasItemsRef = useRef([])
    const draggingImageRef = useRef(null)
    const resizingImageRef = useRef(null)
    const selectedImageIdRef = useRef(null)
    const lastEmitRef = useRef(0)
    const savedBoardDataRef = useRef(null)

    // Predefined colors
    const colorPalette = [
        '#000000', '#FFFFFF', '#EF4444', '#F59E0B', '#10B981',
        '#3B82F6', '#8B5CF6', '#EC4899', '#64748B'
    ]

    // Thickness options
    const pencilSizes = [1, 2, 3, 5, 8]
    const eraserSizes = [10, 15, 20, 30, 40]

    // Get current brush size based on active tool
    const currentBrushSize = activeTool === 'eraser' ? eraserSize : pencilSize

    // Screen sharing state
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [remoteScreenStream, setRemoteScreenStream] = useState(null)
    const [isViewingScreen, setIsViewingScreen] = useState(false)
    const screenVideoRef = useRef(null)
    const localStreamRef = useRef(null)
    const peerConnectionRef = useRef(null)
    const iceCandidatesQueue = useRef([])

    // Host mode state
    const [hostModeEnabled, setHostModeEnabled] = useState(false)
    const [canDraw, setCanDraw] = useState(true)

    // Mobile responsiveness state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Auto-scroll chat
    useEffect(() => {
        if (chatEndRef.current) {
            requestAnimationFrame(() => {
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
            })
        }
    }, [chatMessages])

    // Canvas resize
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const mobileView = window.innerWidth < 768
        const rightPanelWidth = (isChatOpen && !mobileView) ? 320 : 0
        const leftToolbarWidth = mobileView ? 0 : 72
        const topbarHeight = mobileView ? 56 : 64

        if (mobileView) {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight * 0.65
        } else {
            canvas.width = window.innerWidth - leftToolbarWidth - rightPanelWidth
            canvas.height = window.innerHeight - topbarHeight
        }
        ctx.putImageData(snapshot, 0, 0)
    }, [isChatOpen])

    useEffect(() => {
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)
        return () => window.removeEventListener('resize', resizeCanvas)
    }, [resizeCanvas])

    // Touch event handling for drawing (preventing scroll)
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const handleTouchMove = (e) => {
            if (isDrawingRef.current || draggingImageRef.current || resizingImageRef.current) {
                e.preventDefault()
            }
        }

        canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
        return () => canvas.removeEventListener('touchmove', handleTouchMove)
    }, [])

    // Socket setup
    useEffect(() => {
        // Check for saved board data BEFORE socket connects
        const loadBoardData = sessionStorage.getItem('loadBoardData')
        if (loadBoardData) {
            try {
                savedBoardDataRef.current = JSON.parse(loadBoardData)
                sessionStorage.removeItem('loadBoardData')
            } catch (error) {
                console.error('Error loading board data:', error)
            }
        }

        const socket = connectSocket()
        socket.emit('join-room', { roomId: ROOM_ID, userId: MY_USER_ID })

        socket.on('load-canvas', (items) => {
            if (!Array.isArray(items)) return
            // If we have saved board data, use that instead of the server's empty data
            if (savedBoardDataRef.current) {
                setCanvasData(savedBoardDataRef.current)
                savedBoardDataRef.current = null
                return
            }
            setCanvasData(items)
        })

        socket.on('canvas-updated', (items) => {
            if (!Array.isArray(items)) return
            setCanvasData(items)
        })

        socket.on('draw-stroke', (stroke) => {
            if (!stroke) return
            setCanvasData(prev => [...prev, stroke])
        })

        socket.on('draw-segment', ({ segment }) => {
            if (!segment) return
            const canvas = canvasRef.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')

            if (segment.isEraser) {
                ctx.globalCompositeOperation = 'destination-out'
            } else {
                ctx.globalCompositeOperation = 'source-over'
            }

            ctx.beginPath()
            ctx.moveTo(segment.x0, segment.y0)
            ctx.lineTo(segment.x1, segment.y1)
            ctx.strokeStyle = segment.color
            ctx.lineWidth = segment.size
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.stroke()
            ctx.closePath()
            ctx.globalCompositeOperation = 'source-over'
        })

        socket.on('load-chat', (messages) => {
            if (!Array.isArray(messages)) return
            setChatMessages(messages)
        })

        socket.on('receive-message', (msg) => {
            if (!msg) return
            setChatMessages(prev => [...prev, msg])
        })

        socket.on('online-users', (users) => {
            if (!Array.isArray(users)) return
            setOnlineUsers(users)
        })

        socket.on('role-assigned', (role) => {
            setMyRole(role)
        })

        socket.on('host-mode-state', ({ enabled }) => {
            setHostModeEnabled(enabled)
        })

        socket.on('host-mode-changed', ({ enabled }) => {
            setHostModeEnabled(enabled)
        })

        socket.on('image-added', (imgObj) => {
            if (!imgObj?.src) return
            setCanvasData(prev => [...prev, imgObj])
        })

        socket.on('image-updated', ({ imageId, newX, newY }) => {
            setCanvasData(prev => prev.map(item =>
                item.id === imageId ? { ...item, x: newX, y: newY } : item
            ))
        })

        socket.on('image-resized', ({ imageId, newWidth, newHeight }) => {
            setCanvasData(prev => prev.map(item =>
                item.id === imageId ? { ...item, width: newWidth, height: newHeight } : item
            ))
        })

        // WebRTC Screen Sharing Listeners
        socket.on('screen-share-started', ({ userId }) => {
            console.log('Screen sharing started by:', userId)
            if (userId !== MY_USER_ID) {
                setIsViewingScreen(true)
            }
        })

        socket.on('screen-share-stopped', ({ userId }) => {
            console.log('Screen sharing stopped by:', userId)
            setIsViewingScreen(false)
            setRemoteScreenStream(null)
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close()
                peerConnectionRef.current = null
            }
        })

        socket.on('webrtc-offer', async ({ offer, userId }) => {
            console.log('Received WebRTC offer from:', userId)
            try {
                // Create peer connection for viewer
                const pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                })
                peerConnectionRef.current = pc

                // Handle incoming stream
                pc.ontrack = (event) => {
                    console.log('Received remote stream')
                    setRemoteScreenStream(event.streams[0])
                }

                // Handle ICE candidates
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('webrtc-ice-candidate', {
                            roomId: ROOM_ID,
                            candidate: event.candidate,
                            targetUserId: userId
                        })
                    }
                }

                // Set remote description and create answer
                await pc.setRemoteDescription(new RTCSessionDescription(offer))
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)

                // Send answer back
                socket.emit('webrtc-answer', {
                    roomId: ROOM_ID,
                    answer: pc.localDescription,
                    targetUserId: userId
                })

                // Process queued ICE candidates
                while (iceCandidatesQueue.current.length > 0) {
                    const candidate = iceCandidatesQueue.current.shift()
                    await pc.addIceCandidate(new RTCIceCandidate(candidate))
                }
            } catch (error) {
                console.error('Error handling WebRTC offer:', error)
            }
        })

        socket.on('webrtc-answer', async ({ answer, userId }) => {
            console.log('Received WebRTC answer from:', userId)
            try {
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))

                    // Process queued ICE candidates
                    while (iceCandidatesQueue.current.length > 0) {
                        const candidate = iceCandidatesQueue.current.shift()
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
                    }
                }
            } catch (error) {
                console.error('Error handling WebRTC answer:', error)
            }
        })

        socket.on('webrtc-ice-candidate', async ({ candidate, userId }) => {
            console.log('Received ICE candidate from:', userId)
            try {
                if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
                } else {
                    // Queue ICE candidates if remote description not set yet
                    iceCandidatesQueue.current.push(candidate)
                }
            } catch (error) {
                console.error('Error handling ICE candidate:', error)
            }
        })

        return () => {
            socket.off('load-canvas')
            socket.off('canvas-updated')
            socket.off('draw-stroke')
            socket.off('draw-segment')
            socket.off('load-chat')
            socket.off('receive-message')
            socket.off('online-users')
            socket.off('role-assigned')
            socket.off('host-mode-state')
            socket.off('host-mode-changed')
            socket.off('image-added')
            socket.off('image-updated')
            socket.off('image-resized')
            socket.off('screen-share-started')
            socket.off('screen-share-stopped')
            socket.off('webrtc-offer')
            socket.off('webrtc-answer')
            socket.off('webrtc-ice-candidate')
            disconnectSocket()
        }
    }, [ROOM_ID, MY_USER_ID])

    // Sync canvasData
    useEffect(() => {
        canvasItemsRef.current = canvasData
        imagesRef.current = canvasData.filter(i => i.type === 'image')
        redrawAll()
    }, [canvasData])

    // Load saved board data if available
    // Saved board data is now handled in the socket setup effect above
    // via savedBoardDataRef to avoid race condition with load-canvas

    // Update canDraw based on host mode and role
    const updateCanDraw = (hostMode, role) => {
        if (hostMode) {
            setCanDraw(role === 'host')
        } else {
            setCanDraw(true)
        }
    }

    // Update canDraw when myRole changes
    useEffect(() => {
        updateCanDraw(hostModeEnabled, myRole)
    }, [myRole, hostModeEnabled])

    useEffect(() => {
        redrawAll()
    }, [theme])

    const renderStroke = useCallback((stroke) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const { points, color: strokeColor, size, isEraser } = stroke
        if (!points || points.length < 1) return

        if (isEraser) {
            ctx.globalCompositeOperation = 'destination-out'
        } else {
            ctx.globalCompositeOperation = 'source-over'
        }

        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y)
        }
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = size
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
        ctx.closePath()
        ctx.globalCompositeOperation = 'source-over'
    }, [])

    const drawImageOnCanvas = useCallback((imgObj) => {
        const canvas = canvasRef.current
        if (!canvas || !imgObj?.src) return
        const img = new Image()
        img.onload = () => {
            canvas.getContext('2d').drawImage(img, imgObj.x, imgObj.y, imgObj.width, imgObj.height)
        }
        img.src = imgObj.src
    }, [])

    const HANDLE = 10

    const redrawAll = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        canvasItemsRef.current.forEach(item => {
            if (item.type === 'image') drawImageOnCanvas(item)
            else renderStroke(item)
        })
        if (selectedImageIdRef.current) {
            const sel = imagesRef.current.find(i => i.id === selectedImageIdRef.current)
            if (sel) drawSelectionHandle(sel)
        }
    }, [drawImageOnCanvas, renderStroke])

    const drawSelectionHandle = useCallback((img) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx.save()
        ctx.strokeStyle = '#3B82F6'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 3])
        ctx.strokeRect(img.x, img.y, img.width, img.height)
        ctx.setLineDash([])
        ctx.fillStyle = '#3B82F6'
        ctx.fillRect(img.x + img.width - HANDLE, img.y + img.height - HANDLE, HANDLE * 2, HANDLE * 2)
        ctx.restore()
    }, [])

    const getPos = useCallback((e) => {
        const rect = canvasRef.current.getBoundingClientRect()
        const src = e.touches ? e.touches[0] : e
        return { x: src.clientX - rect.left, y: src.clientY - rect.top }
    }, [])

    const onMouseDown = useCallback((e) => {
        // Check if user can draw
        if (!canDraw) {
            return
        }

        const pos = getPos(e)
        const hit = [...imagesRef.current].reverse().find(
            img => pos.x >= img.x && pos.x <= img.x + img.width &&
                pos.y >= img.y && pos.y <= img.y + img.height
        )

        if (hit) {
            const handleX = hit.x + hit.width - HANDLE
            const handleY = hit.y + hit.height - HANDLE
            const isOnHandle = pos.x >= handleX && pos.x <= handleX + HANDLE * 2 &&
                pos.y >= handleY && pos.y <= handleY + HANDLE * 2

            if (isOnHandle) {
                resizingImageRef.current = {
                    id: hit.id,
                    startMouseX: pos.x,
                    startMouseY: pos.y,
                    startW: hit.width,
                    startH: hit.height
                }
                setSelectedImageId(hit.id)
                selectedImageIdRef.current = hit.id
                return
            }

            setSelectedImageId(hit.id)
            selectedImageIdRef.current = hit.id
            draggingImageRef.current = { id: hit.id, offsetX: pos.x - hit.x, offsetY: pos.y - hit.y }
            return
        }

        setSelectedImageId(null)
        selectedImageIdRef.current = null
        currentStroke.current = [pos]
        prevPos.current = pos
        isDrawingRef.current = true
        setIsDrawing(true)

        const ctx = canvasRef.current.getContext('2d')

        if (activeTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out'
        } else {
            ctx.globalCompositeOperation = 'source-over'
        }

        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
    }, [getPos, activeTool, canDraw])

    const onMouseMove = useCallback((e) => {
        const pos = getPos(e)

        if (resizingImageRef.current) {
            const { id, startMouseX, startMouseY, startW, startH } = resizingImageRef.current
            const deltaX = pos.x - startMouseX
            const deltaY = pos.y - startMouseY
            const newWidth = Math.max(50, startW + deltaX)
            const newHeight = Math.max(50, startH + deltaY)

                ;[canvasItemsRef.current, imagesRef.current].forEach(arr =>
                    arr.forEach(i => { if (i.id === id) { i.width = newWidth; i.height = newHeight } })
                )
            redrawAll()

            const now = Date.now()
            if (now - lastEmitRef.current > 33) {
                lastEmitRef.current = now
                const socket = getSocket()
                if (socket?.connected) {
                    socket.emit('resize-image', { roomId: ROOM_ID, imageId: id, newWidth, newHeight })
                }
            }
            return
        }

        if (draggingImageRef.current) {
            const { id, offsetX, offsetY } = draggingImageRef.current
            const newX = pos.x - offsetX
            const newY = pos.y - offsetY

                ;[canvasItemsRef.current, imagesRef.current].forEach(arr =>
                    arr.forEach(i => { if (i.id === id) { i.x = newX; i.y = newY } })
                )
            redrawAll()

            const now = Date.now()
            if (now - lastEmitRef.current > 33) {
                lastEmitRef.current = now
                const socket = getSocket()
                if (socket?.connected) {
                    socket.emit('update-image', { roomId: ROOM_ID, imageId: id, newX, newY })
                }
            }
            return
        }

        if (!isDrawingRef.current) return
        currentStroke.current.push(pos)

        const ctx = canvasRef.current.getContext('2d')
        ctx.lineTo(pos.x, pos.y)
        ctx.strokeStyle = activeTool === 'eraser' ? '#ffffff' : color
        ctx.lineWidth = currentBrushSize
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()

        const prev = prevPos.current
        if (prev) {
            const socket = getSocket()
            if (socket?.connected) {
                socket.emit('draw-segment', {
                    roomId: ROOM_ID,
                    segment: {
                        x0: prev.x,
                        y0: prev.y,
                        x1: pos.x,
                        y1: pos.y,
                        color: activeTool === 'eraser' ? '#ffffff' : color,
                        size: currentBrushSize,
                        isEraser: activeTool === 'eraser'
                    },
                })
            }
        }
        prevPos.current = pos
    }, [getPos, redrawAll, color, currentBrushSize, ROOM_ID, activeTool])

    const onMouseUp = useCallback(() => {
        if (resizingImageRef.current) {
            const { id } = resizingImageRef.current
            const img = imagesRef.current.find(i => i.id === id)
            if (img) {
                setCanvasData(prev => prev.map(item =>
                    item.id === id ? { ...item, width: img.width, height: img.height } : item
                ))

                const socket = getSocket()
                if (socket?.connected) {
                    socket.emit('finalize-image-size', {
                        roomId: ROOM_ID,
                        imageId: id,
                        newWidth: img.width,
                        newHeight: img.height
                    })
                }
            }
            resizingImageRef.current = null
            return
        }

        if (draggingImageRef.current) {
            const { id } = draggingImageRef.current
            const img = imagesRef.current.find(i => i.id === id)
            if (img) {
                setCanvasData(prev => prev.map(item =>
                    item.id === id ? { ...item, x: img.x, y: img.y } : item
                ))

                const socket = getSocket()
                if (socket?.connected) {
                    socket.emit('finalize-image-position', {
                        roomId: ROOM_ID,
                        imageId: id,
                        newX: img.x,
                        newY: img.y
                    })
                }
            }
            draggingImageRef.current = null
            return
        }

        if (!isDrawingRef.current) return
        isDrawingRef.current = false
        setIsDrawing(false)

        const ctx = canvasRef.current.getContext('2d')
        ctx.closePath()
        ctx.globalCompositeOperation = 'source-over'

        if (currentStroke.current.length > 0) {
            const newStroke = {
                points: currentStroke.current,
                color: activeTool === 'eraser' ? '#ffffff' : color,
                size: currentBrushSize,
                userId: MY_USER_ID,
                isEraser: activeTool === 'eraser'
            }

            setCanvasData(prev => [...prev, newStroke])

            const socket = getSocket()
            if (socket?.connected) {
                socket.emit('draw-stroke', {
                    roomId: ROOM_ID,
                    stroke: newStroke,
                })
            }
            currentStroke.current = []
        }
    }, [color, currentBrushSize, MY_USER_ID, ROOM_ID, activeTool])

    const clearCanvas = useCallback(() => {
        const socket = getSocket()
        if (!socket?.connected) return
        socket.emit('clear-board', { roomId: ROOM_ID })
    }, [ROOM_ID])

    const handleUndo = useCallback(() => {
        if (!canDraw) return
        const socket = getSocket()
        if (!socket?.connected) return
        socket.emit('undo-stroke', { roomId: ROOM_ID, userId: MY_USER_ID })
    }, [ROOM_ID, MY_USER_ID, canDraw])

    const handleRedo = useCallback(() => {
        if (!canDraw) return
        const socket = getSocket()
        if (!socket?.connected) return
        socket.emit('redo-stroke', { roomId: ROOM_ID, userId: MY_USER_ID })
    }, [ROOM_ID, MY_USER_ID, canDraw])

    const handleImageUpload = useCallback((e) => {
        // Check if user can upload
        if (!canDraw) {
            alert('Only the host can upload files when host mode is enabled.')
            return
        }

        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ''

        // Check if it's a PDF
        if (file.type === 'application/pdf') {
            // For PDF, we'll convert it to an image using canvas
            const reader = new FileReader()
            reader.onload = async () => {
                try {
                    // Load PDF.js library dynamically
                    const pdfjsLib = window.pdfjsLib || await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js')

                    // Set worker
                    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
                    }

                    const loadingTask = pdfjsLib.getDocument({ data: reader.result })
                    const pdf = await loadingTask.promise
                    const page = await pdf.getPage(1) // Get first page

                    // Prepare canvas
                    const scale = 1.5
                    const viewport = page.getViewport({ scale })
                    const canvas = document.createElement('canvas')
                    const context = canvas.getContext('2d')
                    canvas.height = viewport.height
                    canvas.width = viewport.width

                    // Render PDF page to canvas
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise

                    // Convert canvas to image data
                    const imageData = canvas.toDataURL('image/png')

                    const socket = getSocket()
                    if (socket?.connected) {
                        socket.emit('upload-image', { roomId: ROOM_ID, userId: MY_USER_ID, imageData })
                    }
                } catch (error) {
                    console.error('Error converting PDF:', error)
                    alert('Failed to load PDF. Please try an image file instead.')
                }
            }
            reader.readAsArrayBuffer(file)
        } else {
            // Handle regular image files
            const reader = new FileReader()
            reader.onload = () => {
                const imageData = reader.result
                const socket = getSocket()
                if (socket?.connected) {
                    socket.emit('upload-image', { roomId: ROOM_ID, userId: MY_USER_ID, imageData })
                }
            }
            reader.readAsDataURL(file)
        }
    }, [ROOM_ID, MY_USER_ID, canDraw])

    const sendMessage = useCallback(() => {
        const text = chatInput.trim()
        if (!text) return
        const socket = getSocket()
        if (!socket?.connected) return
        socket.emit('send-message', { roomId: ROOM_ID, userId: MY_USER_ID, message: text })
        setChatInput('')
    }, [chatInput, ROOM_ID, MY_USER_ID])

    const onChatKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }, [sendMessage])

    const copyRoomId = () => {
        navigator.clipboard.writeText(ROOM_ID)
    }

    const handlePencilSizeClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setDropdownPosition({ top: rect.top })
        setShowPencilSize(!showPencilSize)
        setShowEraserSize(false)
        setShowColorPicker(false)
    }

    const handleEraserSizeClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setDropdownPosition({ top: rect.top })
        setShowEraserSize(!showEraserSize)
        setShowPencilSize(false)
        setShowColorPicker(false)
    }

    const handleColorPickerClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setDropdownPosition({ top: rect.top })
        setShowColorPicker(!showColorPicker)
        setShowPencilSize(false)
        setShowEraserSize(false)
    }

    const saveAsImage = () => {
        try {
            const canvas = canvasRef.current
            if (!canvas) {
                alert('Canvas not found. Please try again.')
                return
            }

            // Create a temporary canvas with white background
            const tempCanvas = document.createElement('canvas')
            tempCanvas.width = canvas.width
            tempCanvas.height = canvas.height
            const tempCtx = tempCanvas.getContext('2d')

            // Fill with white background
            tempCtx.fillStyle = '#ffffff'
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

            // Draw the original canvas on top
            tempCtx.drawImage(canvas, 0, 0)

            // Convert to blob and download
            tempCanvas.toBlob((blob) => {
                if (!blob) {
                    alert('Failed to create image. Please try again.')
                    return
                }
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.download = `whiteboard-${ROOM_ID}-${Date.now()}.png`
                link.href = url
                link.click()
                URL.revokeObjectURL(url)
            }, 'image/png')
        } catch (error) {
            console.error('Error saving image:', error)
            alert('Failed to save image. Please try again.')
        }
    }

    const saveBoard = async () => {
        try {
            // Prompt for title first
            const title = prompt('Enter a name for this board:', `Board ${new Date().toLocaleDateString()}`)
            if (!title) return // User cancelled

            const token = localStorage.getItem('auth_token')
            if (!token) {
                alert('❌ Not authenticated. Please login again.')
                return
            }

            // Show simple alert
            console.log('Saving board...')

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
            const response = await fetch(`${API_URL}/api/boards/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    thumbnail: null, // Skip thumbnail for now
                    canvasData: canvasItemsRef.current || [],
                    roomId: ROOM_ID,
                    participantsCount: onlineUsers.length
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Save error:', errorText)
                throw new Error(`Server error: ${response.status}`)
            }

            const data = await response.json()
            console.log('Save success:', data)
            alert('✅ Board saved successfully! You can access it from the Dashboard.')
        } catch (error) {
            console.error('Error saving board:', error)
            alert(`❌ Failed to save board: ${error.message}`)
        }
    }

    // Screen Sharing Functions
    const startScreenShare = async () => {
        try {
            // Get screen stream
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always'
                },
                audio: false
            })

            localStreamRef.current = stream
            setIsScreenSharing(true)

            // Notify server
            const socket = getSocket()
            socket.emit('start-screen-share', { roomId: ROOM_ID })

            // Create peer connections for each viewer
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            })
            peerConnectionRef.current = pc

            // Add stream tracks to peer connection
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream)
            })

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('webrtc-ice-candidate', {
                        roomId: ROOM_ID,
                        candidate: event.candidate
                    })
                }
            }

            // Create and send offer
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            socket.emit('webrtc-offer', {
                roomId: ROOM_ID,
                offer: pc.localDescription
            })

            // Handle stream end (user stops sharing via browser UI)
            stream.getVideoTracks()[0].onended = () => {
                stopScreenShare()
            }

        } catch (error) {
            console.error('Error starting screen share:', error)
            alert('Failed to start screen sharing. Please try again.')
        }
    }

    const stopScreenShare = () => {
        // Stop local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop())
            localStreamRef.current = null
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
            peerConnectionRef.current = null
        }

        setIsScreenSharing(false)

        // Notify server
        const socket = getSocket()
        socket.emit('stop-screen-share', { roomId: ROOM_ID })
    }

    // Toggle host mode
    const toggleHostMode = () => {
        const newState = !hostModeEnabled
        const socket = getSocket()
        if (socket?.connected) {
            socket.emit('toggle-host-mode', { roomId: ROOM_ID, enabled: newState })
        }
    }

    // Update screen video element when remote stream changes
    useEffect(() => {
        if (screenVideoRef.current && remoteScreenStream) {
            screenVideoRef.current.srcObject = remoteScreenStream
        }
    }, [remoteScreenStream])

    return (
        <div className="whiteboard-wrapper">
            {/* Top Header */}
            <div className="whiteboard-header">
                <div className="header-left">
                    <span className="room-label">{isMobile ? `${ROOM_ID.substring(0, 8)}...` : `Room: ${ROOM_ID}`}</span>
                    <button className={isMobile ? "header-icon-btn" : "copy-btn"} onClick={copyRoomId} title="Copy Room ID">
                        📋 {!isMobile && 'Copy Room ID'}
                    </button>
                </div>

                <div className="header-right">
                    <div className="online-indicator">
                        <span className="online-dot"></span>
                        <span>{onlineUsers.length} {!isMobile && 'online'}</span>
                    </div>

                    <button
                        className="header-icon-btn"
                        onClick={() => imageInputRef.current?.click()}
                        title="Upload File (Images & PDF)"
                    >
                        📤
                    </button>
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                    />

                    {/* Screen Share Button (Host Only) */}
                    {myRole === 'host' && (
                        <button
                            className="header-icon-btn"
                            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
                            style={{
                                backgroundColor: isScreenSharing ? '#ef4444' : 'transparent',
                                color: isScreenSharing ? '#fff' : 'inherit'
                            }}
                        >
                            {isScreenSharing ? '🛑' : '🖥️'}
                        </button>
                    )}

                    {/* Host Mode Toggle (Host Only) */}
                    {myRole === 'host' && (
                        <button
                            className="header-icon-btn"
                            onClick={toggleHostMode}
                            title={hostModeEnabled ? 'Host Mode: ON (Only you can draw)' : 'Host Mode: OFF (Everyone can draw)'}
                            style={{
                                backgroundColor: hostModeEnabled ? '#10b981' : '#f97316',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                padding: '0.5rem 0.75rem',
                                minWidth: '80px'
                            }}
                        >
                            {hostModeEnabled ? '🔒 HOST' : '🔓 ALL'}
                        </button>
                    )}

                    <button
                        className="header-icon-btn"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    <button
                        className="header-icon-btn chat-toggle-btn"
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        title={isChatOpen ? 'Close Chat' : 'Open Chat'}
                    >
                        💬
                    </button>

                    <button className={isMobile ? "header-icon-btn" : "leave-btn"} style={isMobile ? { color: '#ef4444' } : {}} onClick={() => navigate('/dashboard')}>
                        🚪 {!isMobile && 'Leave'}
                    </button>
                </div>
            </div>

            <div className="whiteboard-content">
                {/* Left Toolbar */}
                <div className={`left-toolbar ${isMobile ? 'mobile-toolbar' : ''}`} style={{ opacity: !canDraw ? 0.5 : 1, pointerEvents: !canDraw ? 'none' : 'auto' }}>
                    {/* Pencil Tool */}
                    <div className="tool-group">
                        <button
                            className={`tool-btn ${activeTool === 'pencil' ? 'active' : ''}`}
                            onClick={() => setActiveTool('pencil')}
                            title="Pencil"
                            disabled={!canDraw}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                                <path d="M2 2l7.586 7.586" />
                            </svg>
                        </button>

                        {/* Pencil Size Button */}
                        <div className="tool-dropdown">
                            <button
                                ref={pencilSizeRef}
                                className="size-btn"
                                onClick={handlePencilSizeClick}
                                title="Pencil Size"
                            >
                                <span className="size-text">{pencilSize}</span>
                            </button>

                            {showPencilSize && (
                                <div className="size-dropdown" style={{ top: `${dropdownPosition.top}px` }}>
                                    <div className="size-label">Pencil Size</div>
                                    {pencilSizes.map((size) => (
                                        <button
                                            key={size}
                                            className={`size-option ${pencilSize === size ? 'active' : ''}`}
                                            onClick={() => {
                                                setPencilSize(size)
                                                setShowPencilSize(false)
                                                setActiveTool('pencil')
                                            }}
                                        >
                                            <div
                                                className="size-preview"
                                                style={{
                                                    width: `${Math.min(size * 2, 20)}px`,
                                                    height: `${Math.min(size * 2, 20)}px`,
                                                    backgroundColor: 'currentColor'
                                                }}
                                            />
                                            <span>{size}px</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Eraser Tool */}
                    <div className="tool-group">
                        <button
                            className={`tool-btn ${activeTool === 'eraser' ? 'active' : ''}`}
                            onClick={() => setActiveTool('eraser')}
                            title="Eraser"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 20H7L3 16l10-10 7 7-4 4" />
                                <path d="M10 10l4 4" />
                            </svg>
                        </button>

                        {/* Eraser Size Button */}
                        <div className="tool-dropdown">
                            <button
                                ref={eraserSizeRef}
                                className="size-btn"
                                onClick={handleEraserSizeClick}
                                title="Eraser Size"
                            >
                                <span className="size-text">{eraserSize}</span>
                            </button>

                            {showEraserSize && (
                                <div className="size-dropdown" style={{ top: `${dropdownPosition.top}px` }}>
                                    <div className="size-label">Eraser Size</div>
                                    {eraserSizes.map((size) => (
                                        <button
                                            key={size}
                                            className={`size-option ${eraserSize === size ? 'active' : ''}`}
                                            onClick={() => {
                                                setEraserSize(size)
                                                setShowEraserSize(false)
                                                setActiveTool('eraser')
                                            }}
                                        >
                                            <div
                                                className="size-preview"
                                                style={{
                                                    width: `${Math.min(size, 24)}px`,
                                                    height: `${Math.min(size, 24)}px`,
                                                    backgroundColor: 'currentColor'
                                                }}
                                            />
                                            <span>{size}px</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="toolbar-divider"></div>

                    {/* Color Picker Button */}
                    <div className="tool-dropdown">
                        <button
                            ref={colorPickerRef}
                            className="tool-btn color-picker-btn"
                            onClick={handleColorPickerClick}
                            title="Colors"
                        >
                            <div className="color-preview" style={{ backgroundColor: color }}></div>
                        </button>

                        {showColorPicker && (
                            <div className="color-picker-dropdown" style={{ top: `${dropdownPosition.top}px` }}>
                                <div className="color-label">Choose Color</div>
                                <div className="color-grid">
                                    {colorPalette.map((c) => (
                                        <button
                                            key={c}
                                            className={`color-option ${color === c ? 'active' : ''}`}
                                            style={{
                                                backgroundColor: c,
                                                border: c === '#FFFFFF' ? '2px solid #e5e7eb' : 'none'
                                            }}
                                            onClick={() => {
                                                setColor(c)
                                                setActiveTool('pencil')
                                                setShowColorPicker(false)
                                            }}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="toolbar-divider"></div>

                    <button className="tool-btn" onClick={handleUndo} title="Undo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 7v6h6" />
                            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
                        </svg>
                    </button>

                    <button className="tool-btn" onClick={handleRedo} title="Redo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 7v6h-6" />
                            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
                        </svg>
                    </button>

                    <div className="toolbar-divider"></div>

                    <button className="tool-btn" onClick={saveAsImage} title="Save as Image">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </button>

                    <button className="tool-btn" onClick={saveBoard} title="Save Board">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                    </button>

                    <div className="toolbar-divider"></div>

                    <button
                        className="tool-btn"
                        onClick={clearCanvas}
                        disabled={myRole !== 'host'}
                        title={myRole !== 'host' ? 'Only host can clear' : 'Clear Canvas'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                    </button>
                    {isMobile && (
                        <>
                            <div className="toolbar-divider"></div>
                            <button className="tool-btn" style={{ color: '#ef4444' }} onClick={() => navigate('/dashboard')} title="Leave Room">
                                🚪
                            </button>
                        </>
                    )}
                </div>

                {/* Canvas Area */}
                <div className="canvas-area">
                    {/* Drawing Disabled Overlay */}
                    {!canDraw && (
                        <div style={{
                            position: 'absolute',
                            top: '1rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'rgba(239, 68, 68, 0.95)',
                            color: '#fff',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            zIndex: 100,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>🔒</span>
                            <span>Host Mode: Only host can draw</span>
                        </div>
                    )}

                    <canvas
                        ref={canvasRef}
                        className="drawing-canvas"
                        style={{
                            cursor: !canDraw ? 'not-allowed' : (isDrawing ? 'crosshair' : 'default'),
                            background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                            display: isViewingScreen ? 'none' : 'block',
                            opacity: !canDraw ? 0.7 : 1,
                            touchAction: 'none'
                        }}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                        onTouchStart={onMouseDown}
                        onTouchMove={onMouseMove}
                        onTouchEnd={onMouseUp}
                        onTouchCancel={onMouseUp}
                    />

                    {/* Screen Share Viewer */}
                    {isViewingScreen && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            {remoteScreenStream ? (
                                <video
                                    ref={screenVideoRef}
                                    autoPlay
                                    playsInline
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    color: '#fff',
                                    fontSize: '1.25rem',
                                    textAlign: 'center',
                                    padding: '2rem'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖥️</div>
                                    <div>Waiting for screen share...</div>
                                </div>
                            )}
                            <button
                                onClick={() => setIsViewingScreen(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#ef4444',
                                    color: '#fff',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem'
                                }}
                            >
                                ✕ Close Screen View
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Panel or Modal */}
                {isChatOpen && (
                    <div className={isMobile ? `right-panel modal-view ${activeTab === 'chat' ? 'modal-chat' : 'modal-users'}` : "right-panel"}>
                        {/* Tabs */}
                        <div className="panel-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                                onClick={() => setActiveTab('chat')}
                            >
                                💬 Chat
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                                onClick={() => setActiveTab('users')}
                            >
                                👥 Users
                            </button>
                            {isMobile && (
                                <button className="close-panel-btn" onClick={() => setIsChatOpen(false)}>
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Chat Tab */}
                        {activeTab === 'chat' && (
                            <div className="chat-container">
                                <div className="chat-messages">
                                    {chatMessages.map((msg, i) => {
                                        const isMe = msg.userId === MY_USER_ID
                                        const senderName = isMe ? 'You' : (msg.userName || msg.userId)
                                        return (
                                            <div key={msg._id ?? i} className={`message ${isMe ? 'me' : 'other'}`}>
                                                <div className="message-header">
                                                    <span className="message-sender">{senderName}</span>
                                                    <span className="message-time">
                                                        {msg.timestamp
                                                            ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : ''}
                                                    </span>
                                                </div>
                                                <div className="message-bubble">{msg.message}</div>
                                            </div>
                                        )
                                    })}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="chat-input-container">
                                    <input
                                        type="text"
                                        className="chat-input"
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={onChatKeyDown}
                                        placeholder="Type a message..."
                                    />
                                    <button className="send-btn" onClick={sendMessage}>
                                        Send
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="users-container">
                                <div className="users-list">
                                    {onlineUsers.map((uid) => {
                                        const isMe = uid === MY_USER_ID
                                        const userRole = isMe ? myRole : null
                                        return (
                                            <div key={uid} className="user-item">
                                                <div className="user-info">
                                                    <span className="user-dot"></span>
                                                    <span className="user-name">
                                                        {isMe ? `${USERNAME} (you)` : uid}
                                                    </span>
                                                </div>
                                                {userRole === 'host' && (
                                                    <span className="user-badge">Host</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {onlineUsers.length === 0 && (
                                        <div className="empty-state">No users online</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Floating Buttons */}
            {isMobile && !isChatOpen && (
                <>
                    <button className="mobile-floating-btn users-float-btn" onClick={() => { setActiveTab('users'); setIsChatOpen(true); }} title="Users">
                        👥
                    </button>
                    <button className="mobile-floating-btn chat-float-btn" onClick={() => { setActiveTab('chat'); setIsChatOpen(true); }} title="Chat">
                        💬
                    </button>
                </>
            )}
        </div>
    )
}

export default Whiteboard
