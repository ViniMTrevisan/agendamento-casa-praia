// Importa os matchers do jest-dom (ex: .toBeInTheDocument())
// Isso faz com que eles fiquem disponíveis globalmente em todos os testes.
import '@testing-library/jest-dom';
// Polyfill global.fetch for tests to prevent ReferenceError from libraries
if (typeof global.fetch === 'undefined') {
	// Provide a jest mock implementation that tests can override per-suite
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: async () => ({}) }));
}