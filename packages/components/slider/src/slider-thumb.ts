/* -------------------------------------------------------------------------------------------------
 * SliderThumb
 * ----------------------------------------------------------------------------------------------- */

const THUMB_NAME = 'SliderThumb'

export type SliderThumbElement = SliderThumbImplElement
interface SliderThumbProps extends Omit<SliderThumbImplProps, 'index'> {}

const SliderThumb = React.forwardRef<SliderThumbElement, SliderThumbProps>(
  (props: ScopedProps<SliderThumbProps>, forwardedRef) => {
    const getItems = useCollection(props.__scopeSlider)
    const [thumb, setThumb] = React.useState<SliderThumbImplElement | null>(null)
    const composedRefs = useComposedRefs(forwardedRef, node => setThumb(node))
    const index = React.useMemo(
      () => (thumb ? getItems().findIndex(item => item.ref.current === thumb) : -1),
      [getItems, thumb],
    )
    // return <SliderThumbImpl {...props} ref={composedRefs} index={index} />;
  },
)

type SliderThumbImplElement = React.ElementRef<typeof Primitive.span>
interface SliderThumbImplProps extends PrimitiveSpanProps {
  index: number
}

const SliderThumbImpl = React.forwardRef<SliderThumbImplElement, SliderThumbImplProps>(
  (props: ScopedProps<SliderThumbImplProps>, forwardedRef) => {
    const { __scopeSlider, index, ...thumbProps } = props
    const context = useSliderContext(THUMB_NAME, __scopeSlider)
    const orientation = useSliderOrientationContext(THUMB_NAME, __scopeSlider)
    const [thumb, setThumb] = React.useState<HTMLSpanElement | null>(null)
    const composedRefs = useComposedRefs(forwardedRef, node => setThumb(node))
    const size = useSize(thumb)
    // We cast because index could be `-1` which would return undefined
    const value = context.values[index] as number | undefined
    const percent
      = value === undefined ? 0 : convertValueToPercentage(value, context.min, context.max)
    const label = getLabel(index, context.values.length)
    const orientationSize = size?.[orientation.size]
    const thumbInBoundsOffset = orientationSize
      ? getThumbInBoundsOffset(orientationSize, percent, orientation.direction)
      : 0

    React.useEffect(() => {
      if (thumb) {
        context.thumbs.add(thumb)
        return () => {
          context.thumbs.delete(thumb)
        }
      }
    }, [thumb, context.thumbs])

  //   return (
  //     <span
  //       style={{
  //         transform: 'var(--radix-slider-thumb-transform)',
  //         position: 'absolute',
  //         [orientation.startEdge]: `calc(${percent}% + ${thumbInBoundsOffset}px)`,
  //       }}
  //     >
  //       <Collection.ItemSlot scope={props.__scopeSlider}>
  //         <Primitive.span
  //           role="slider"
  //           aria-label={props['aria-label'] || label}
  //           aria-valuemin={context.min}
  //           aria-valuenow={value}
  //           aria-valuemax={context.max}
  //           aria-orientation={context.orientation}
  //           data-orientation={context.orientation}
  //           data-disabled={context.disabled ? '' : undefined}
  //           tabIndex={context.disabled ? undefined : 0}
  //           {...thumbProps}
  //           ref={composedRefs}
  //           /**
  //            * There will be no value on initial render while we work out the index so we hide thumbs
  //            * without a value, otherwise SSR will render them in the wrong position before they
  //            * snap into the correct position during hydration which would be visually jarring for
  //            * slower connections.
  //            */
  //           style={value === undefined ? { display: 'none' } : props.style}
  //           onFocus={composeEventHandlers(props.onFocus, () => {
  //             context.valueIndexToChangeRef.current = index;
  //           })}
  //         />
  //       </Collection.ItemSlot>
  //     </span>
  //   );
  },
)

SliderThumb.displayName = THUMB_NAME
