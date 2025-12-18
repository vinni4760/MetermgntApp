import React from 'react';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hoverable = true,
    gradient = false
}) => {
    return (
        <div className={`card ${hoverable ? 'card-hoverable' : ''} ${gradient ? 'card-gradient' : ''} ${className}`}>
            {children}
        </div>
    );
};
