import {Component, type ReactNode} from 'react';

// import type {ReactNode} from 'react'

interface Props {
    children: ReactNode;
    name: string;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = {hasError: false};

    static getDerivedStateFromError(): State {
        return {hasError: true};
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-700 font-medium text-sm">{this.props.name} failed to load</p>
                    <button
                        onClick={() => this.setState({hasError: false})}
                        className="mt-3 text-xs text-red-600 underline"
                    >
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}