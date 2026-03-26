import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['tests/**/*.ts'],
        exclude: ['node_modules', 'dist'],
    },
});
//# sourceMappingURL=vitest.config.js.map