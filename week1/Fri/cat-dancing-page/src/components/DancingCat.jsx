import { useState, useEffect } from 'react'
import catSvg from '../assets/images/cat.svg'
import '../styles/DancingCat.css'

const DancingCat = () => {
  const [isAnimating, setIsAnimating] = useState(true)
  const [animationType, setAnimationType] = useState('dance')

  const handleToggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  const handleAnimationChange = (type) => {
    setAnimationType(type)
  }

  return (
    <div className="dancing-cat-container">
      <div
        className={`cat-wrapper ${isAnimating ? `animated-${animationType}` : ''}`}
      >
        <img
          src={catSvg}
          alt="Dancing Cat"
          className="cat-image"
        />
      </div>

      <div className="control-panel">
        <button
          onClick={handleToggleAnimation}
          className={`control-btn ${isAnimating ? 'stop' : 'start'}`}
        >
          {isAnimating ? '⏸️ 정지' : '▶️ 시작'}
        </button>

        <div className="animation-controls">
          <h3>댄스 스타일 선택:</h3>
          <div className="dance-buttons">
            <button
              onClick={() => handleAnimationChange('dance')}
              className={`dance-btn ${animationType === 'dance' ? 'active' : ''}`}
            >
              🕺 기본 댄스
            </button>
            <button
              onClick={() => handleAnimationChange('bounce')}
              className={`dance-btn ${animationType === 'bounce' ? 'active' : ''}`}
            >
              🦘 바운스
            </button>
            <button
              onClick={() => handleAnimationChange('spin')}
              className={`dance-btn ${animationType === 'spin' ? 'active' : ''}`}
            >
              🌪️ 회전
            </button>
            <button
              onClick={() => handleAnimationChange('shake')}
              className={`dance-btn ${animationType === 'shake' ? 'active' : ''}`}
            >
              🎉 흔들기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DancingCat