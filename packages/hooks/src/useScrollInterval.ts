import { useRef, useEffect } from 'react';
import { PageUtil } from '~/utils';

const inRect = (rect, x, y) => {
  return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
};

export default function useScrollInterval(
  tableRef,
  { editable, platform, scrollConfig, getScrollContainer }
) {
  if (platform === 'mobile') {
    return;
  }

  const scrollTimer = useRef(0);

  // 关闭轮播
  const closeAutoScroll = () => {
    clearTimeout(scrollTimer.current); // 先清除轮播定时（如果有，关闭上一次轮播）
  };

  // 开启或关闭轮播
  const resetAutoScroll = (resetScrollTop = false) => {
    if (!tableRef.current) {
      return;
    }
    closeAutoScroll();

    if (!editable && scrollConfig.enabled) {
      const timeout = scrollConfig.scrollInterval * 1000 || 1500;
      const tableBody = getScrollContainer();
      const rowHeight = tableBody.querySelector('tr').clientHeight; // NOTE! 因为有合并单元格，不要取th或td的高度
      let nextScrollTop;

      if (resetScrollTop) {
        tableBody.scrollTop = 0;
        nextScrollTop = rowHeight;
      } else {
        nextScrollTop = tableBody.scrollTop - (tableBody.scrollTop % rowHeight) + rowHeight;
      }

      const scrollFn = scrollTop => {
        if (!tableRef.current) {
          return;
        }
        const tableBody = getScrollContainer();

        if (tableBody) {
          PageUtil.animateProp(tableBody, { scrollTop }, 800);
        }
        scrollTimer.current = setTimeout(() => {
          if (scrollTop + tableBody.clientHeight >= tableBody.scrollHeight - 1) {
            tableBody.scrollTop = 0;
            scrollTop = -rowHeight;
          }
          scrollFn(scrollTop + rowHeight);
        }, timeout);
      };

      scrollTimer.current = setTimeout(() => scrollFn(nextScrollTop), timeout - 500);
    }
  };

  useEffect(() => {
    if (!editable) {
      setTimeout(resetAutoScroll, 300); // TODO: 有问题？
    }

    return () => {
      closeAutoScroll();
    };
  }, [editable]);

  const mouseEnterHandler = () => {
    closeAutoScroll();

    const tableRect = tableRef.current.getBoundingClientRect();

    const mouseLeaveHandler = ev => {
      if (!inRect(tableRect, ev.pageX, ev.pageY)) {
        document.removeEventListener('mousemove', mouseLeaveHandler);
        resetAutoScroll();
      }
    };

    document.removeEventListener('mousemove', mouseLeaveHandler);
    document.addEventListener('mousemove', mouseLeaveHandler);
  };

  return mouseEnterHandler;
}
