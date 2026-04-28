/**
 * Component-level tests for Converter.vue covering the full user flow:
 * input → convert → output → copy/download.
 *
 * Wraps the component in NMessageProvider since Converter uses useMessage().
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { NConfigProvider, NMessageProvider } from 'naive-ui';
import Converter from './Converter.vue';

function mountWithProviders() {
  const Wrapper = defineComponent({
    render() {
      return h(NConfigProvider, null, {
        default: () => h(NMessageProvider, null, { default: () => h(Converter) }),
      });
    },
  });
  return mount(Wrapper, { attachTo: document.body });
}

const SAMPLE = `{Reference Type}: Journal Article
{Title}: 算法导论
{Author}: 科尔曼
{Journal}: J
{Year}: 2020
`;

describe('Converter', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows an error when convert is clicked with empty input', async () => {
    const wrapper = mountWithProviders();
    await wrapper.find('[data-testid="convert-btn"]').trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('请粘贴 NoteExpress');
    wrapper.unmount();
  });

  it('fills sample then converts to a non-empty BibTeX output', async () => {
    const wrapper = mountWithProviders();

    await wrapper.find('[data-testid="fill-sample-btn"]').trigger('click');
    await flushPromises();

    const inputEl = wrapper.find<HTMLTextAreaElement>('[data-testid="input-textarea"] textarea');
    expect(inputEl.element.value).toContain('{Reference Type}');

    await wrapper.find('[data-testid="convert-btn"]').trigger('click');
    await vi.runAllTimersAsync();
    await flushPromises();

    const outputEl = wrapper.find<HTMLTextAreaElement>('[data-testid="output-textarea"] textarea');
    expect(outputEl.element.value).toContain('@Article{');
    wrapper.unmount();
  });

  it('clears both input and output when clear button is clicked', async () => {
    const wrapper = mountWithProviders();
    await wrapper.find('[data-testid="fill-sample-btn"]').trigger('click');
    await flushPromises();
    await wrapper.find('[data-testid="convert-btn"]').trigger('click');
    await vi.runAllTimersAsync();
    await flushPromises();

    await wrapper.find('[data-testid="clear-btn"]').trigger('click');
    await flushPromises();

    const inputEl = wrapper.find<HTMLTextAreaElement>('[data-testid="input-textarea"] textarea');
    const outputEl = wrapper.find<HTMLTextAreaElement>('[data-testid="output-textarea"] textarea');
    expect(inputEl.element.value).toBe('');
    expect(outputEl.element.value).toBe('');
    wrapper.unmount();
  });

  it('uses navigator.clipboard.writeText when copy is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const wrapper = mountWithProviders();
    const inputEl = wrapper.find<HTMLTextAreaElement>('[data-testid="input-textarea"] textarea');
    await inputEl.setValue(SAMPLE);

    await wrapper.find('[data-testid="convert-btn"]').trigger('click');
    await vi.runAllTimersAsync();
    await flushPromises();

    await wrapper.find('[data-testid="copy-btn"]').trigger('click');
    await flushPromises();

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain('@Article{');
    wrapper.unmount();
  });

  it('triggers a download with citation.bib filename', async () => {
    const wrapper = mountWithProviders();
    const inputEl = wrapper.find<HTMLTextAreaElement>('[data-testid="input-textarea"] textarea');
    await inputEl.setValue(SAMPLE);

    await wrapper.find('[data-testid="convert-btn"]').trigger('click');
    await vi.runAllTimersAsync();
    await flushPromises();

    const createObjectURL = vi.fn().mockReturnValue('blob:fake');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    });

    const clickSpy = vi.fn();
    const realCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreateElement(tag) as HTMLElement;
      if (tag === 'a') (el as HTMLAnchorElement).click = clickSpy;
      return el;
    });

    await wrapper.find('[data-testid="download-btn"]').trigger('click');
    await flushPromises();

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
});
