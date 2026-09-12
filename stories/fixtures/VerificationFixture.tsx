import { useCallback, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as stylex from '@stylexjs/stylex';

/** Internal verification fixture. It is not a Frame UI public component. */
export interface VerificationFixtureProps {
  heading?: string;
  initialError?: boolean;
  initialOpen?: boolean;
}

export function VerificationFixture({
  heading = '브라우저 검증',
  initialError = false,
  initialOpen = false,
}: VerificationFixtureProps) {
  const id = useId();
  const [name, setName] = useState('');
  const [error, setError] = useState(initialError);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(initialOpen);
  const trigger = useRef<HTMLButtonElement>(null);
  const focusCloseOnMount = useCallback((element: HTMLButtonElement | null) => {
    element?.focus();
  }, []);

  return (
    <>
      <main {...stylex.props(styles.surface)} data-testid="verification-fixture">
        <p {...stylex.props(styles.eyebrow)}>FRAME UI · INTERNAL FIXTURE</p>
        <h1 {...stylex.props(styles.heading)}>{heading}</h1>
        <p {...stylex.props(styles.description)}>
          입력 오류, 키보드 포커스와 Portal 검사를 재현합니다.
        </p>
        <form
          noValidate
          {...stylex.props(styles.form)}
          onSubmit={(event) => {
            event.preventDefault();
            const hasName = Boolean(name.trim());
            setError(!hasName);
            setSaved(hasName);
          }}
        >
          <label htmlFor={`${id}-name`} {...stylex.props(styles.label)}>
            이름
          </label>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
            }}
            aria-invalid={error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...stylex.props(styles.input)}
          />
          {error && (
            <p id={`${id}-error`} role="alert" {...stylex.props(styles.error)}>
              이름을 입력해 주세요.
            </p>
          )}
          <button type="submit" {...stylex.props(styles.button)}>
            저장
          </button>
          {saved && <p role="status">{name} 저장 완료</p>}
        </form>
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls={open ? `${id}-portal` : undefined}
          onClick={() => setOpen((current) => !current)}
          {...stylex.props(styles.button, styles.secondary)}
        >
          도움말 열기
        </button>
      </main>
      {open &&
        createPortal(
          <section
            id={`${id}-portal`}
            aria-labelledby={`${id}-portal-title`}
            data-testid="portal"
            {...stylex.props(styles.surface, styles.portal)}
          >
            <h2 id={`${id}-portal-title`} {...stylex.props(styles.subheading)}>
              입력 도움말
            </h2>
            <p>이 영역은 미리보기 body에 Portal로 렌더링됩니다.</p>
            <button
              type="button"
              ref={focusCloseOnMount}
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
              {...stylex.props(styles.button)}
            >
              도움말 닫기
            </button>
          </section>,
          document.body,
        )}
    </>
  );
}

const styles = stylex.create({
  surface: {
    boxSizing: 'border-box',
    fontFamily: '"Noto Sans KR", sans-serif',
    fontSize: 16,
    lineHeight: 1.6,
    color: '#18243a',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#c3cddd',
    borderRadius: 12,
    padding: 24,
    maxWidth: 600,
    overflowWrap: 'anywhere',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: '#40516c',
    margin: 0,
  },
  heading: {
    fontWeight: 600,
    fontSize: 28,
    lineHeight: 1.3,
    marginTop: 12,
    marginBottom: 12,
  },
  subheading: { fontWeight: 600, fontSize: 20, marginTop: 0 },
  description: { marginTop: 0, marginBottom: 24 },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 24,
  },
  label: { fontWeight: 600 },
  input: {
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
    font: 'inherit',
    padding: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#68788f',
    borderRadius: 6,
    outline: { default: 'none', ':focus-visible': '3px solid #1861d9' },
    outlineOffset: 3,
  },
  button: {
    font: 'inherit',
    fontWeight: 600,
    backgroundColor: '#194eaa',
    color: '#ffffff',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#194eaa',
    borderRadius: 6,
    padding: '10px 16px',
    cursor: 'pointer',
    outline: { default: 'none', ':focus-visible': '3px solid #1861d9' },
    outlineOffset: 3,
  },
  secondary: { color: '#194eaa', backgroundColor: '#ffffff' },
  error: { color: '#a31824', margin: 0 },
  portal: {
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: '#f2f6ff',
  },
});
