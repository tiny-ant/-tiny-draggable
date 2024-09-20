import React, { PropsWithChildren, ReactElement, useRef } from 'react'

export default function GridItem(props: PropsWithChildren<{ dragging: boolean }>) {
  const { dragging, children } = props
  const cachedChild = useRef<ReactElement>(children as ReactElement)

  if (dragging) {
    console.log('dragging, cloning', cachedChild.current)

    return cachedChild.current
    // return React.cloneElement(child, {
    //   className: child.props.className,
    // })
  }

  console.log('cache expired', children)
  cachedChild.current = React.Children.only(children as ReactElement)

  return cachedChild.current
}
