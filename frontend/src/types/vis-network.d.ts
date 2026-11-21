declare module 'vis-network/standalone' {
  export class Network {
    constructor(container: HTMLElement, data: any, options?: any);
    destroy(): void;
    fit(options?: any): void;
    redraw(): void;
  }
}

declare module 'vis-network' {
  export class Network {
    constructor(container: HTMLElement, data: any, options?: any);
    destroy(): void;
    fit(options?: any): void;
    redraw(): void;
  }
}
