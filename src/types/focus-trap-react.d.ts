declare module 'focus-trap-react' {
  import * as React from 'react';
  type FocusTrapProps = {
    active?: boolean;
    focusTrapOptions?: unknown;
    children?: React.ReactNode;
  } & React.HTMLAttributes<HTMLElement>;
  const FocusTrap: React.ComponentType<FocusTrapProps>;
  export default FocusTrap;
}
