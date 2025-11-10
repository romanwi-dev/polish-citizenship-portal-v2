declare module 'react-helmet' {
  import { Component, ReactNode } from 'react';

  export interface HelmetProps {
    children?: ReactNode;
  }

  export class Helmet extends Component<HelmetProps> {}
}
