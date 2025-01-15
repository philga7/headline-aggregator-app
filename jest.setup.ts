import '@testing-library/jest-dom';
import { fetch } from 'cross-fetch';

// Make fetch available globally
global.fetch = fetch;
