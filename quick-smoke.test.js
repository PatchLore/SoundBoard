import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

test('React rendering works', () => {
  const TestComponent = () => <div>Hello Test</div>;
  const { getByText } = render(<TestComponent />);
  expect(getByText('Hello Test')).toBeInTheDocument();
});

test('Environment variables are accessible', () => {
  // Test that VITE_ environment variables are accessible
  expect(import.meta.env.VITE_APP_NAME).toBeDefined();
  expect(import.meta.env.VITE_DEMO_MODE).toBeDefined();
});

test('Basic component structure works', () => {
  const AppComponent = () => (
    <div>
      <h1>Stream Soundboard</h1>
      <p>Test Component</p>
    </div>
  );
  const { getByText } = render(<AppComponent />);
  expect(getByText('Stream Soundboard')).toBeInTheDocument();
  expect(getByText('Test Component')).toBeInTheDocument();
});
