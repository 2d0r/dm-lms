import React from 'react';
import './LoadingAnimation.css';

export default function LoadingAnimation() {
  return (
    <div className='loading-container'>
        <div id='loading-square-1' className='square'></div>
        <div id='loading-square-2' className='square'></div>
        <div id='loading-square-3' className='square'></div>
    </div>
  )
}
