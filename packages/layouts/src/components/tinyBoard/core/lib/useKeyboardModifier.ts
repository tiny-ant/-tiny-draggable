import { useRef } from 'react';
import { useEventListener, useKeyPress } from 'ahooks';

export default function useKeyboardModifier() {
  /** 记录按下的多选组合键('ctrl' | 'shift' | 'meta')，目前仅支持ctrl键多选 */
  const keyCodeRef = useRef<string>();

  useKeyPress('ctrl', () => {
    keyCodeRef.current = 'ctrl';
  });
  // mac系统 command键
  useKeyPress('meta', () => {
    keyCodeRef.current = 'ctrl';
  });
  useKeyPress('shift', () => {
    keyCodeRef.current = 'shift';
  });
  useEventListener('keyup', ev => {
    if (['Shift', 'Control', 'Meta'].includes(ev.key)) {
      keyCodeRef.current = undefined;
    }
  });

  return keyCodeRef;
}
