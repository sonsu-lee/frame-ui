import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { VerificationFixture } from './VerificationFixture';

const meta = {
  title: 'Components/Internal/Verification',
  component: VerificationFixture,
  args: {
    heading: '브라우저 검증',
    initialError: false,
    initialOpen: false,
  },
  argTypes: {
    heading: { control: 'text' },
    initialError: {
      control: false,
      description: '마운트 시 초기 오류 상태. Error Story에서 확인합니다.',
    },
    initialOpen: {
      control: false,
      description: '마운트 시 초기 Portal 상태. PortalOpen Story에서 확인합니다.',
    },
  },
} satisfies Meta<typeof VerificationFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Error: Story = { args: { initialError: true } };
export const PortalOpen: Story = {
  args: { initialOpen: true },
  // Keep the body-mounted Portal in an isolated document when rendered by Autodocs.
  parameters: { docs: { story: { inline: false } } },
};
export const LongText: Story = {
  args: {
    heading:
      '좁은 화면에서도 긴 한국어 문구와 LongUnbrokenTextMustWrapWithoutHorizontalOverflow를 확인합니다',
  },
};

export const Interaction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fixture = canvasElement.querySelector<HTMLElement>(
      '[data-testid="verification-fixture"]',
    );
    if (!fixture) throw new globalThis.Error('verification fixture did not render');
    const fontFamily = getComputedStyle(fixture).fontFamily;
    await expect(fontFamily).toContain('Noto Sans KR');

    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('이름을 입력해 주세요.');
    await userEvent.type(canvas.getByRole('textbox', { name: '이름' }), '프레임');
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('프레임 저장 완료');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();

    const trigger = canvas.getByRole('button', { name: '도움말 열기' });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole('button', { name: '도움말 닫기' })).toHaveFocus();
    await userEvent.click(body.getByRole('button', { name: '도움말 닫기' }));
    await expect(trigger).toHaveFocus();

    // Keep the Portal open so addon-a11y also scans its body content.
    await userEvent.click(trigger);
    await expect(body.getByTestId('portal')).toBeVisible();
    const input = canvas.getByRole('textbox', { name: '이름' });
    await userEvent.clear(input);
    await userEvent.type(input, '프레임 확인');
    await expect(input).toHaveValue('프레임 확인');
    await expect(input).toHaveFocus();
  },
};
