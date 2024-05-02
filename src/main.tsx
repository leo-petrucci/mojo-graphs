import React from 'react';
import { createRoot } from 'react-dom/client';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import Example from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <div
    style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        height: 500,
        width: '100%',
      }}
    >
      <ParentSize>
        {({ width, height }) => <Example width={width} height={height} />}
      </ParentSize>
    </div>
  </div>
);
