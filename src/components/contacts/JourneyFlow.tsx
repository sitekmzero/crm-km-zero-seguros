import { useState, useRef, useEffect } from 'react'
import { ContactStatus } from '@/stores/useContactsStore'
import { cn } from '@/lib/utils'
import { Check, Circle, ArrowRight } from 'lucide-react'

interface JourneyFlowProps {
  currentStatus: ContactStatus
}

const STAGES: { id: ContactStatus; label: string }[] = [
  { id: 'subscriber', label: 'Assinante' },
  { id: 'lead', label: 'Lead' },
  { id: 'marketing_qualified_lead', label: 'Lead qualificado para marketing' },
  { id: 'sales_qualified_lead', label: 'Lead qualificado para venda' },
  { id: 'opportunity', label: 'Oportunidade' },
  { id: 'customer', label: 'Cliente' },
]

export function JourneyFlow({ currentStatus }: JourneyFlowProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 50, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate current stage index for highlighting logic
  const currentStageIndex = STAGES.findIndex((s) => s.id === currentStatus)

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomSensitivity = 0.001
    const newScale = Math.min(
      Math.max(0.5, scale - e.deltaY * zoomSensitivity),
      2,
    )
    setScale(newScale)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Center the view on the current node initially
  useEffect(() => {
    if (containerRef.current && currentStageIndex !== -1) {
      const nodeWidth = 240
      const gap = 80
      const centerOffset = containerRef.current.clientWidth / 2 - nodeWidth / 2
      const targetX = -(currentStageIndex * (nodeWidth + gap)) + centerOffset
      setPosition({ x: targetX, y: 150 }) // y=150 to center vertically roughly
    }
  }, [currentStageIndex])

  return (
    <div
      ref={containerRef}
      className="w-full h-[500px] bg-slate-50 relative overflow-hidden cursor-grab active:cursor-grabbing border border-gray-200 rounded-lg select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
          backgroundPosition: `${position.x}px ${position.y}px`,
        }}
      />

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <button
          className="bg-white border border-gray-200 p-2 rounded-md shadow-sm hover:bg-gray-50 text-xs font-bold"
          onClick={() => setScale((s) => Math.min(s + 0.1, 2))}
        >
          +
        </button>
        <button
          className="bg-white border border-gray-200 p-2 rounded-md shadow-sm hover:bg-gray-50 text-xs font-bold"
          onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
        >
          -
        </button>
      </div>

      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
        className="absolute top-0 left-0 flex items-center"
      >
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentStageIndex
          const isCurrent = index === currentStageIndex
          const isFuture = index > currentStageIndex

          return (
            <div key={stage.id} className="flex items-center">
              {/* Connection Line */}
              {index > 0 && (
                <div
                  className={cn(
                    'w-20 h-1 transition-colors duration-300',
                    isCompleted || isCurrent ? 'bg-primary' : 'bg-gray-200',
                  )}
                />
              )}

              {/* Node */}
              <div
                className={cn(
                  'relative w-[240px] p-4 rounded-[20px] border-2 transition-all duration-300 flex flex-col items-center text-center gap-2 shadow-sm bg-white',
                  isCurrent &&
                    'border-primary ring-4 ring-primary/10 shadow-lg scale-105 z-10',
                  isCompleted && 'border-primary/50 text-gray-600',
                  isFuture &&
                    'border-gray-200 text-gray-400 border-dashed bg-gray-50/50',
                )}
              >
                {/* Status Indicator Icon */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                    isCurrent &&
                      'bg-primary text-primary-foreground border-primary',
                    isCompleted &&
                      'bg-primary/10 text-primary border-primary/50',
                    isFuture && 'bg-gray-100 text-gray-300 border-gray-200',
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Circle className="w-4 h-4 fill-current" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'font-semibold text-sm',
                    isCurrent ? 'text-primary' : 'text-gray-700',
                    isFuture && 'text-gray-400',
                  )}
                >
                  {stage.label}
                </span>

                {/* Annotation for Current */}
                {isCurrent && (
                  <div className="absolute -top-3 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider animate-fade-in-down">
                    Atual
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
