import React from 'react';

const NotAuthorized = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            fontFamily: 'Arial, sans-serif',
        }}>
            <h1>You do not have permission to access this page.</h1>
        </div>
    );
};

export default NotAuthorized;
