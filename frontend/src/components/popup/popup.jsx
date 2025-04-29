import React from 'react';
import './popup.css';

export default function Popup({ show, title, text, buttonLabels=[], buttonOnClicks=[] }) {
    return <div className={`modal-overlay fade-in-out${show ? ' show' : ''}`}>
        <div className={`popup scale-up-down${show ? ' show' : ''}`}>
            <div className='top-bar'>{title}</div>
            <div className='content'>
                {text}
                <div className='buttons'>
                    {buttonLabels.map((label, idx) => {
                        return <button onClick={buttonOnClicks[idx]} key={`popup-button-${idx}`}>{label}</button>
                    })}
                </div>
            </div>
        </div>
    </div>;
}
