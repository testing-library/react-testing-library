// Simple test to verify the fix
const React = require('react');
const { render, fireEvent, screen } = require('./src');

// Mock console.log to capture output
const originalLog = console.log;
const logs = [];
console.log = (...args) => {
  logs.push(args);
  originalLog(...args);
};

// Test component
function TestComponent() {
  const handleMouseEnter = (e) => {
    console.log('mouseEnter relatedTarget:', e.relatedTarget?.tagName || 'null');
  };
  
  return React.createElement('div', { onMouseEnter: handleMouseEnter }, 'Hello');
}

// Run test
const { container } = render(React.createElement(TestComponent));
const element = container.firstChild;
const mockRelatedTarget = document.createElement('span');

fireEvent.mouseEnter(element, {
  relatedTarget: mockRelatedTarget,
});

// Check result
const lastLog = logs[logs.length - 1];
if (lastLog && lastLog[1] === 'SPAN') {
  console.log('✅ Fix works! relatedTarget is correctly forwarded');
} else {
  console.log('❌ Fix failed. relatedTarget:', lastLog?.[1]);
}

// Restore console.log
console.log = originalLog;