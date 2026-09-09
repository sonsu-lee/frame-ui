import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import '../../src/styles.css';

const styles = stylex.create({
  root: { padding: 7 },
  width: (value: number) => ({ width: value }),
});

// Build-only fixture: this is not part of the public component library.
export function BuildProbe() {
  const [count] = useState(0);
  return <button {...stylex.props(styles.root, styles.width(37))}>{count}</button>;
}
