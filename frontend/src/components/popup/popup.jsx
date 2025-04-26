import React from 'react';
import './popup.css';

export default function Popup({ title, text, buttonLabel, buttonOnClick }) {
    return <div className='modal-overlay'>
        <div className='popup'>
            <div className='top-bar'>{title}</div>
            <div className='content'>
                {text}
                <div className='buttons'>
                    {buttonLabel.map((label, idx) => {
                        return <button onClick={buttonOnClick[idx]} key={`popup-button-${idx}`}>{label}</button>
                    })}
                </div>
            </div>
        </div>
    </div>;
}
