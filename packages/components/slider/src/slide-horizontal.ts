/* eslint-disable unused-imports/no-unused-vars */
/* -------------------------------------------------------------------------------------------------
 * SliderHorizontal
 * ----------------------------------------------------------------------------------------------- */

import type { useSize } from '@oku-ui/use-composable'
import { useComposedRefs, useForwardRef } from '@oku-ui/use-composable'
import { useDirection } from '@oku-ui/direction'
import { defineComponent, h, ref, toRefs } from 'vue'
import type { PropType } from 'vue'
import type { InstanceTypeRef, MergeProps } from '@oku-ui/primitive'
import { BACK_KEYS, SLIDER_NAME, createSliderContext } from './slider'
import type { Direction, SliderElement } from './slider'
import { linearScale } from './utiles'

type Side = 'top' | 'right' | 'bottom' | 'left'

export const [SliderOrientationProvider, useSliderOrientationContext] = createSliderContext<{
  startEdge: Side
  endEdge: Side
  size: keyof NonNullable<ReturnType<typeof useSize>>
  direction: number
}>(SLIDER_NAME, {
  startEdge: 'left',
  endEdge: 'right',
  size: 'width',
  direction: 1,
})

export type SliderOrientationPrivateProps = {
  min: number
  max: number
  inverted: boolean
  onSlideStart?(value: number): void
  onSlideMove?(value: number): void
  onSlideEnd?(): void
  onHomeKeyDown(event: KeyboardEvent): void
  onEndKeyDown(event: KeyboardEvent): void
  onStepKeyDown(step: { event: KeyboardEvent; direction: number }): void
}
interface SliderOrientationProps
  extends Omit<SliderImplProps, keyof SliderImplPrivateProps>,
  SliderOrientationPrivateProps {}

type SliderHorizontalElement = SliderImplElement
export type _SliderHorizontalEl = HTMLDivElement

interface SliderHorizontalProps extends SliderOrientationProps {
  dir?: Direction
}

// const SliderHorizontal = React.forwardRef<SliderHorizontalElement, SliderHorizontalProps>(
//   (props: ScopedProps<SliderHorizontalProps>, forwardedRef) => {
// const SLIDER_NAME = 'SliderHorizontal'

const SliderHorizontal = defineComponent({
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
    dir: {
      type: String as PropType<Direction>,
      // required: true,
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
    const { ...SliderHorizontalAttrs } = attrs as SliderElement

    const {
      min,
      max,
      dir,
      inverted,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onStepKeyDown,
      ...sliderProps
    } = toRefs(props)

    const slider = ref<SliderImplElement | null>(null)
    const forwardedRef = useForwardRef()
    const composedRefs = useComposedRefs(forwardedRef, (node) => {
      if (node instanceof HTMLElement)
        slider.value = node
    })
    const rectRef = ref<ClientRect>()
    const direction = useDirection(dir)
    const isDirectionLTR = direction === 'ltr'
    const isSlidingFromLeft = (isDirectionLTR && !inverted) || (!isDirectionLTR && inverted)

    function getValueFromPointer(pointerPosition: number) {
      const rect = rectRef.value || slider!.getBoundingClientRect()
      const input: [number, number] = [0, rect.width]
      const output: [number, number] = isSlidingFromLeft ? [min.value, max.value] : [max.value, min.value]
      const value = linearScale(input, output)

      rectRef.value = rect
      return value(pointerPosition - rect.left)
    }

    return h(SliderOrientationProvider, {
      scope: props.__scopeSlider,
      startEdge: isSlidingFromLeft ? 'left' : 'right',
      endEdge: isSlidingFromLeft ? 'right' : 'left',
      direction: isSlidingFromLeft ? 1 : -1,
      size: 'width',
    }, [
      h(SliderImpl, {
        'dir': direction,
        'data-orientation': 'horizontal',
        ...sliderProps,
        'ref': composedRefs,
        'style': {
          ...sliderProps.style,
          '--radix-slider-thumb-transform': 'translateX(-50%)',
        },
        'onSlideStart': (event: MouseEvent) => {
          const value = getValueFromPointer(event.clientX)
          onSlideStart.value?.(value)
        },
        'onSlideMove': (event: MouseEvent) => {
          const value = getValueFromPointer(event.clientX)
          onSlideMove.value?.(value)
        },
        'onSlideEnd': () => {
          rectRef.value = undefined
          onSlideEnd.value?.()
        },
        'onStepKeyDown': (event: KeyboardEvent) => {
          const slideDirection = isSlidingFromLeft ? 'from-left' : 'from-right'
          const isBackKey = BACK_KEYS[slideDirection].includes(event.key)
          onStepKeyDown.value?.({ event, direction: isBackKey ? -1 : 1 })
        },
      }),
    ])
  },
})

type _SliderHorizontalProps = MergeProps<SliderHorizontalProps, SliderHorizontalElement>
type InstanceSliderHorizontalType = InstanceTypeRef<typeof SliderHorizontal, _SliderHorizontalEl>

const OkuSliderHorizontal = SliderHorizontal as typeof SliderHorizontal & (new () => { $props: _SliderHorizontalProps })

export { OkuSliderHorizontal }
export type { SliderHorizontalProps, SliderHorizontalElement, InstanceSliderHorizontalType }
