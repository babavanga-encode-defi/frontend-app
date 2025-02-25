import { FC, ReactNode } from 'react';

export interface DialogProps {
  children?: ReactNode;
  className?: string;
}

export const Dialog: FC<DialogProps>;
export const DialogContent: FC<DialogProps>;
export const DialogHeader: FC<DialogProps>;
export const DialogTitle: FC<DialogProps>; 