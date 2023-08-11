/* -------------------------------------------------------------------------------------------------
 * SliderRange
 * ----------------------------------------------------------------------------------------------- */

import { Primitive } from '@oku-ui/primitive'
import { defineComponent, h, ref } from 'vue'
import { useComposedRefs, useForwardRef } from '@oku-ui/use-composable'
import { convertValueToPercentage } from './utiles'

const RANGE_NAME = 'SliderRange'

type SliderRangeElement = React.ElementRef<typeof Primitive.span>
interface SliderRangeProps extends PrimitiveSpanProps {}

// const SliderRange = React.forwardRef<SliderRangeElement, SliderRangeProps>(
// (props: ScopedProps<SliderRangeProps>, forwardedRef) => {

const SliderRange = defineComponent({
  name: RANGE_NAME,
  inheritAttrs: false,
  // props: {
  //   asChild: {
  //     type: Boolean,
  //     default: undefined,
  //   },
  // },
  setup(props, { attrs }) {
    const { __scopeSlider, ...rangeProps } = toRef(props)
    const context = useSliderContext(RANGE_NAME, __scopeSlider)
    const orientation = useSliderOrientationContext(RANGE_NAME, __scopeSlider)
    const spanRef = ref<HTMLSpanElement | null>(null)
    const forwardedRef = useForwardRef()
    const composedRefs = useComposedRefs(forwardedRef, spanRef)
    const valuesCount = context.values.length
    const percentages = context.values.map(value =>
      convertValueToPercentage(value, context.min, context.max),
    )
    const offsetStart = valuesCount > 1 ? Math.min(...percentages) : 0
    const offsetEnd = 100 - Math.max(...percentages)

    return h(
      Primitive.span,
      {
        'data-orientation': context.orientation,
        'data-disabled': context.disabled ? '' : undefined,
        ...rangeProps,
        'ref': composedRefs,
        'style': {
          ...props.style,
          [orientation.startEdge]: `${offsetStart}%`,
          [orientation.endEdge]: `${offsetEnd}%`,
        },
      },
    )
  },
})
