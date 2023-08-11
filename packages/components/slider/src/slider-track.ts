/* -------------------------------------------------------------------------------------------------
 * SliderTrack
 * ----------------------------------------------------------------------------------------------- */

import { Primitive } from '@oku-ui/primitive'
import type { ComponentPropsWithoutRef, ElementType } from '@oku-ui/primitive'
import { useForwardRef } from '@oku-ui/use-composable'
import { defineComponent, h, toRef } from 'vue'
import { useSliderContext } from './slider'

const TRACK_NAME = 'SliderTrack'

type SliderTrackElement = ElementType<'span'>
type PrimitiveSpanProps = ComponentPropsWithoutRef<typeof Primitive.span>
// interface SliderTrackProps extends PrimitiveSpanProps {}

// const SliderTrack = React.forwardRef<SliderTrackElement, SliderTrackProps>(
//   (props: ScopedProps<SliderTrackProps>, forwardedRef) => {

const SliderTrack = defineComponent({
  name: TRACK_NAME,
  inheritAttrs: false,
  // props: {
  //   asChild: {
  //     type: Boolean,
  //     default: undefined,
  //   },
  // },
  setup(props, { attrs }) {
    const { __scopeSlider, ...trackProps } = toRef(props)

    const forwardedRef = useForwardRef()
    const context = useSliderContext(TRACK_NAME, __scopeSlider)

    return h(
      Primitive.span,
      {
        'data-disabled': context.value.disabled ? '' : undefined,
        'data-orientation': context.value.orientation,
        ...trackProps,
        'ref': forwardedRef,
      },
    )
  },
})
