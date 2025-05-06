import React from 'react';
import './LoadingAnimation.css';

export default function LoadingAnimation({ inline = false }) {
  return (
    <div
      className={['loading-container', inline ? 'inline' : ''].join(' ')}
      data-testid='loading-animation'
    >
        <div id='loading-square-1' className='square'></div>
        <div id='loading-square-2' className='square'></div>
        <div id='loading-square-3' className='square'></div>
    </div>
  )
}
