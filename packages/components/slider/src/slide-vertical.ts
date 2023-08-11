/* -------------------------------------------------------------------------------------------------
 * SliderVertical
 * ----------------------------------------------------------------------------------------------- */

import { useComposedRefs, useForwardRef } from '@oku-ui/use-composable'
import type { PropType } from 'vue'
import { defineComponent, h, ref, toRefs } from 'vue'
import type { InstanceTypeRef, MergeProps } from '@oku-ui/primitive'
import { linearScale } from './utiles'
import type { SliderElement } from './slider'
import { BACK_KEYS } from './slider'
import { type SliderOrientationPrivateProps, SliderOrientationProvider } from './slide-horizontal'

type SliderVerticalElement = SliderImplElement
export type _SliderVerticalEl = HTMLDivElement

interface SliderVerticalProps extends SliderOrientationPrivateProps {}

const SLIDER_NAME = 'SliderVertical'

const SliderVertical = defineComponent({
  name: SLIDER_NAME,
  inheritAttrs: false,
  props: {
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    inverted: {
      type: Boolean,
      required: true,
    },
    onSlideStart: {
      type: Function as PropType<SliderOrientationPrivateProps['onSlideStart']>,
      required: false,
    },
    onSlideMove: {
      type: Function as PropType<SliderOrientationPrivateProps['onSlideMove']>,
      required: false,
    },
    onSlideEnd: {
      type: Function as PropType<SliderOrientationPrivateProps['onSlideEnd']>,
      required: false,
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
    const { ...SliderVerticalAttrs } = attrs as SliderElement

    const {
      min,
      max,
      inverted,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onStepKeyDown,
      ...sliderProps
    } = toRefs(props)

    const sliderRef = ref<SliderImplElement>(null)
    const forwardedRef = useForwardRef()
    const composedRef = useComposedRefs(forwardedRef, sliderRef)
    const rectRef = ref<ClientRect>()
    const isSlidingFromBottom = !inverted

    function getValueFromPointer(pointerPosition: number) {
      const rect = rectRef.value || sliderRef.value!.getBoundingClientRect()
      const input: [number, number] = [0, rect.height]
      const output: [number, number] = isSlidingFromBottom ? [max.value, min.value] : [min.value, max.value]
      const value = linearScale(input, output)

      rectRef.value = rect
      return value(pointerPosition - rect.top)
    }

    return h(SliderOrientationProvider, {
      scope: props.__scopeSlider,
      startEdge: isSlidingFromBottom ? 'bottom' : 'top',
      endEdge: isSlidingFromBottom ? 'top' : 'bottom',
      size: 'height',
      direction: isSlidingFromBottom ? 1 : -1,
    }, [
      h(SliderImpl, {
        'data-orientation': 'vertical',
        ...sliderProps,
        'ref': composedRef,
        'style': {
          ...sliderProps.style,
          '--radix-slider-thumb-transform': 'translateY(50%)',
        },
        'onSlideStart': (event: MouseEvent) => {
          const value = getValueFromPointer(event.clientY)
          onSlideStart.value?.(value)
        },
        'onSlideMove': (event: MouseEvent) => {
          const value = getValueFromPointer(event.clientY)
          onSlideMove.value?.(value)
        },
        'onSlideEnd': () => {
          rectRef.value = undefined
          onSlideEnd.value?.()
        },
        'onStepKeyDown': (event: KeyboardEvent) => {
          const slideDirection = isSlidingFromBottom ? 'from-bottom' : 'from-top'
          const isBackKey = BACK_KEYS[slideDirection].includes(event.key)
          onStepKeyDown.value?.({ event, direction: isBackKey ? -1 : 1 })
        },
      }),
    ])
  },
})

type _SliderVerticalProps = MergeProps<SliderVerticalProps, SliderVerticalElement>
type InstanceSliderVerticalType = InstanceTypeRef<typeof SliderVertical, _SliderVerticalEl>

const OkuSliderVertical = SliderVertical as typeof SliderVertical & (new () => { $props: _SliderVerticalProps })

export { OkuSliderVertical }
export type { SliderVerticalProps, SliderVerticalElement, InstanceSliderVerticalType }
