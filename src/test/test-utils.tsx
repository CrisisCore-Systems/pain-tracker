import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../design-system/ThemeProvider';
import { ToneProvider } from '../contexts/ToneContext';

// Add all required providers for testing
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider defaultMode="light">
      <ToneProvider>
        {children}
      </ToneProvider>
    </ThemeProvider>
  );
};

// Custom render that wraps with ThemeProvider and ToneProvider by default
// but allows additional wrapper to be passed in
const customRender = (
  ui: ReactElement,
  options?: RenderOptions
) => {
  const { wrapper: AdditionalWrapper, ...restOptions } = options || {};
  
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const content = <AllTheProviders>{children}</AllTheProviders>;
    return AdditionalWrapper ? <AdditionalWrapper>{content}</AdditionalWrapper> : content;
  };
  
  return render(ui, { wrapper: Wrapper, ...restOptions });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render }; 