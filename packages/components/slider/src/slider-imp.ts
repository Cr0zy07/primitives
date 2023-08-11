/* eslint-disable unused-imports/no-unused-vars */
/* -------------------------------------------------------------------------------------------------
 * SliderImpl
 * ----------------------------------------------------------------------------------------------- */

import type { ComponentPropsWithoutRef, ElementType } from '@oku-ui/primitive'
import { Primitive } from '@oku-ui/primitive'
import type { PropType } from 'vue'
import { defineComponent, h, toRefs } from 'vue'
import { useForwardRef } from '@oku-ui/use-composable'
import type { SliderElement } from './slider'
import { ARROW_KEYS, PAGE_KEYS, useSliderContext } from './slider'
import type { SliderOrientationPrivateProps } from './slide-horizontal'

type SliderImplElement = ElementType<'span'>
type PrimitiveDivProps = ComponentPropsWithoutRef<typeof Primitive.div>
type SliderImplPrivateProps = {
  onSlideStart(event: PointerEvent): void
  onSlideMove(event: PointerEvent): void
  onSlideEnd(event: PointerEvent): void
  onHomeKeyDown(event: KeyboardEvent): void
  onEndKeyDown(event: KeyboardEvent): void
  onStepKeyDown(event: KeyboardEvent): void
}
// interface SliderImplProps extends PrimitiveDivProps, SliderImplPrivateProps {}

// const SliderImpl = React.forwardRef<SliderImplElement, SliderImplProps>(
//   (props: ScopedProps<SliderImplProps>, forwardedRef) => {

const SLIDER_NAME = 'SliderImpl'

const SliderImpl = defineComponent({
  name: SLIDER_NAME,
  inheritAttrs: true,
  props: {
    onSlideStart: {
      type: Function as PropType<SliderOrientationPrivateProps['onSlideStart']>,
      required: true,
    },
    onSlideMove: {
      type: Function as PropType<SliderOrientationPrivateProps['onSlideMove']>,
      required: true,
    },
    onSlideEnd: {
      type: Function as PropType<SliderOrientationPrivateProps['onSlideEnd']>,
      required: true,
    },
    onHomeKeyDown: {
      type: Function as PropType<SliderOrientationPrivateProps['onHomeKeyDown']>,
      required: true,
    },
    onEndKeyDown: {
      type: Function as PropType<SliderOrientationPrivateProps['onEndKeyDown']>,
      required: true,
    },
    onStepKeyDown: {
      type: Function as PropType<SliderOrientationPrivateProps['onStepKeyDown']>,
      required: true,
    },
    asChild: {
      type: Boolean,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const { ...SliderImpAttrs } = attrs as SliderElement
    const forwardedRef = useForwardRef()

    const {
      __scopeSlider,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onHomeKeyDown,
      onEndKeyDown,
      onStepKeyDown,
      ...sliderProps
    } = toRefs(props)

    const context = useSliderContext(SLIDER_NAME, __scopeSlider)

    return h(
      Primitive.span,
      {
        ...sliderProps,
        ref: forwardedRef,
        onKeyDown: composeEventHandlers(props.onKeyDown, (event: any) => {
          if (event.key === 'Home') {
            onHomeKeyDown.value(event)
            // Prevent scrolling to page start
            event.preventDefault()
          }
          else if (event.key === 'End') {
            onEndKeyDown.value(event)
            // Prevent scrolling to page end
            event.preventDefault()
          }
          else if (PAGE_KEYS.concat(ARROW_KEYS).includes(event.key)) {
            onStepKeyDown.value(event)
            // Prevent scrolling for directional key presses
            event.preventDefault()
          }
        }),
        onPointerDown: composeEventHandlers(props.onPointerDown, (event: PointerEvent) => {
          const target = event.target
          target?.setPointerCapture(event.pointerId)
          // Prevent browser focus behaviour because we focus a thumb manually when values change.
          event.preventDefault()
          // Touch devices have a delay before focusing so won't focus if touch immediately moves
          // away from target (sliding). We want thumb to focus regardless.
          if (context.thumbs.has(target))
            target?.focus()

          else
            onSlideStart.value?.(event)
        }),
        onPointerMove: composeEventHandlers(props.onPointerMove, (event: PointerEvent) => {
          const target = event.target
          if (target?.hasPointerCapture(event.pointerId))
            onSlideMove.value?.(event)
        }),
        onPointerUp: composeEventHandlers(props.onPointerUp, (event: PointerEvent) => {
          const target = event.target
          if (target?.hasPointerCapture(event.pointerId)) {
            target?.releasePointerCapture(event.pointerId)
            onSlideEnd.value?.(event)
          }
        }),
      },
    )
  },
})
