'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

const MUSIC_FILES = ['/music/Refrain.mp3']

let sharedAudio: HTMLAudioElement | null = null
let lastLoadedTrackIndex: number | null = null

function getSharedAudio(): HTMLAudioElement | null {
	if (typeof window === 'undefined') return null
	if (!sharedAudio) {
		sharedAudio = new Audio()
	}
	return sharedAudio
}

type MusicPlayerContextValue = {
	isPlaying: boolean
	progress: number
	togglePlayPause: () => void
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null)

export function useMusicPlayer(): MusicPlayerContextValue {
	const ctx = useContext(MusicPlayerContext)
	if (!ctx) {
		throw new Error('useMusicPlayer must be used within MusicPlayerProvider')
	}
	return ctx
}

type MusicPlayerProviderProps = {
	children: ReactNode
	enabled: boolean
}

export function MusicPlayerProvider({ children, enabled }: MusicPlayerProviderProps) {
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [progress, setProgress] = useState(0)
	const currentIndexRef = useRef(0)
	const playPauseSyncedRef = useRef(false)

	useEffect(() => {
		if (!enabled) return
		const audio = getSharedAudio()
		if (!audio) return

		const updateProgress = () => {
			if (audio.duration) {
				setProgress((audio.currentTime / audio.duration) * 100)
			}
		}

		const handleEnded = () => {
			const nextIndex = (currentIndexRef.current + 1) % MUSIC_FILES.length
			currentIndexRef.current = nextIndex
			setCurrentIndex(nextIndex)
			setProgress(0)
		}

		audio.addEventListener('timeupdate', updateProgress)
		audio.addEventListener('ended', handleEnded)
		audio.addEventListener('loadedmetadata', updateProgress)

		return () => {
			audio.removeEventListener('timeupdate', updateProgress)
			audio.removeEventListener('ended', handleEnded)
			audio.removeEventListener('loadedmetadata', updateProgress)
		}
	}, [enabled])

	useEffect(() => {
		if (!enabled) return
		const audio = getSharedAudio()
		if (!audio) return

		currentIndexRef.current = currentIndex
		if (lastLoadedTrackIndex === currentIndex && audio.src) {
			return
		}

		lastLoadedTrackIndex = currentIndex
		const wasPlaying = !audio.paused
		audio.pause()
		audio.src = MUSIC_FILES[currentIndex]
		audio.loop = false
		setProgress(0)

		if (wasPlaying) {
			audio.play().catch(console.error)
		}
	}, [currentIndex, enabled])

	useEffect(() => {
		if (!enabled) return
		const audio = getSharedAudio()
		if (!audio) return

		if (!playPauseSyncedRef.current) {
			playPauseSyncedRef.current = true
			setIsPlaying(!audio.paused)
			return
		}

		if (isPlaying) {
			audio.play().catch(console.error)
		} else {
			audio.pause()
		}
	}, [isPlaying, enabled])

	const togglePlayPause = useCallback(() => {
		setIsPlaying(p => !p)
	}, [])

	const value: MusicPlayerContextValue = {
		isPlaying,
		progress,
		togglePlayPause
	}

	return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>
}
