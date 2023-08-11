/* eslint-disable unused-imports/no-unused-vars */
import type {
  AriaAttributes,
  InstanceTypeRef,
  MergeProps,
} from '@oku-ui/primitive'
import type { Scope } from '@oku-ui/provide'
import type { PropType } from 'vue'
import { createCollection } from '@oku-ui/collection'
import { createProvideScope } from '@oku-ui/provide'
import { useComposedRefs, useControllable, useForwardRef } from '@oku-ui/use-composable'
import { clamp } from '@oku-ui/utils'
import { computed, defineComponent, ref, toRefs, useModel } from 'vue'
import { getClosestValueIndex, getDecimalCount, getNextSortedValues, hasMinStepsBetweenValues, roundValue } from './utiles'
import type { SliderThumbElement } from './slider-thumb'
import { OkuSliderVertical } from './slide-vertical'
import type { SliderVerticalElement, SliderVerticalProps } from './slide-vertical'
import { OkuSliderHorizontal } from './slide-horizontal'
import type { SliderHorizontalElement, SliderHorizontalProps, SliderOrientationPrivateProps } from './slide-horizontal'

export type Direction = 'ltr' | 'rtl'

export const PAGE_KEYS = ['PageUp', 'PageDown']
export const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

type SlideDirection = 'from-left' | 'from-right' | 'from-bottom' | 'from-top'
export const BACK_KEYS: Record<SlideDirection, string[]> = {
  'from-left': ['Home', 'PageDown', 'ArrowDown', 'ArrowLeft'],
  'from-right': ['Home', 'PageDown', 'ArrowDown', 'ArrowRight'],
  'from-bottom': ['Home', 'PageDown', 'ArrowDown', 'ArrowLeft'],
  'from-top': ['Home', 'PageDown', 'ArrowUp', 'ArrowLeft'],
}

/* -------------------------------------------------------------------------------------------------
 * Slider
 * ----------------------------------------------------------------------------------------------- */

export const SLIDER_NAME = 'Slider'

const [Collection, useCollection, createCollectionScope]
  = createCollection<SliderThumbElement>(SLIDER_NAME)

export type ScopedProps<P> = P & { __scopeSlider?: Scope }
export const [createSliderContext, createSliderScope] = createProvideScope(SLIDER_NAME, [
  createCollectionScope,
])

type SliderContextValue = {
  disabled?: boolean
  min: number
  max: number
  values: number[]
  valueIndexToChangeRef: React.MutableRefObject<number>
  thumbs: Set<SliderThumbElement>
  orientation: SliderProps['orientation']
}

export const [SliderProvider, useSliderContext] = createSliderContext<SliderContextValue>(SLIDER_NAME)

type SliderElement = SliderHorizontalElement | SliderVerticalElement
export type _SliderEl = HTMLDivElement

interface SliderProps extends Omit<SliderHorizontalProps | SliderVerticalProps, keyof SliderOrientationPrivateProps | 'defaultValue'> {
  name?: string
  disabled?: boolean
  orientation?: AriaAttributes['aria-orientation']
  dir?: Direction
  min?: number
  max?: number
  step?: number
  minStepsBetweenThumbs?: number
  value?: number[]
  defaultValue?: number[]
  onValueChange?(value: number[]): void
  onValueCommit?(value: number[]): void
  inverted?: boolean
}

const Slider = defineComponent({
  name: SLIDER_NAME,
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Boolean] as PropType<boolean>,
      default: undefined,
    },
    name: {
      type: String,
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    orientation: {
      type: String as PropType<SliderProps['orientation']>,
      default: 'horizontal',
    },
    dir: {
      type: String as PropType<Direction>,
      default: undefined,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
    minStepsBetweenThumbs: {
      type: Number,
      default: 0,
    },
    value: {
      // type: [Number],
    },
    defaultValue: {
      // type: [Number],
      // default: [min],
    },
    onValueChange: {
      type: Function as PropType<SliderProps['onValueChange']>,
    },
    onValueCommit: {
      type: Function as PropType<SliderProps['onValueCommit']>,
    },
    inverted: {
      type: Boolean,
      default: false,
    },
    asChild: {
      type: Boolean,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const { ...SliderAttrs } = attrs as SliderElement

    const {
      name,
      orientation,
      disabled,
      min,
      max,
      step,
      minStepsBetweenThumbs,
      defaultValue,
      value,
      onValueChange,
      onValueCommit,
      inverted,
      ...sliderProps
    } = toRefs(props)

    const slider = ref<HTMLSpanElement | null>(null)
    const forwardedRef = useForwardRef()
    const composedRefs = useComposedRefs(forwardedRef, (node) => {
      if (node instanceof HTMLSpanElement)
        slider.value = node
    })
    const thumbRefs = ref<SliderContextValue['thumbs']>(new Set())
    const valueIndexToChangeRef = ref<number>(0)
    const isHorizontal = orientation.value === 'horizontal'
    // We set this to true by default so that events bubble to forms without JS (SSR)
    const isFormControl = slider.value ? Boolean(slider.value.closest('form')) : true
    const SliderOrientation = isHorizontal ? OkuSliderHorizontal : OkuSliderVertical

    const modelValue = useModel(props, 'modelValue')

    const { state, updateValue } = useControllable({
      prop: computed(() => modelValue.value ?? value.value),
      defaultProp: computed(() => defaultValue.value),
      onChange: (result: any) => {
        // emit('update:checked', result)
        // emit('update:modelValue', result)
        const thumbs = [...thumbRefs.value]
        thumbs[valueIndexToChangeRef.value]?.focus()
        onValueChange(result)
      },
    })
    const valuesBeforeSlideStartRef: any = ref(state.value)

    function handleSlideStart(value: number) {
      const closestIndex = getClosestValueIndex(state.value as number[], value)
      updateValues(value, closestIndex)
    }

    function handleSlideMove(value: number) {
      updateValues(value, valueIndexToChangeRef.value)
    }

    function handleSlideEnd() {
      const prevValue = valuesBeforeSlideStartRef.value[valueIndexToChangeRef.value]
      const nextValue = state.value[valueIndexToChangeRef.value]
      const hasChanged = nextValue !== prevValue
      // if (hasChanged)
      // onValueCommit(state.value)
    }

    function updateValues(value: number, atIndex: number, { commit } = { commit: false }) {
      const decimalCount = getDecimalCount(step.value)
      const snapToStep = roundValue(Math.round((value - min.value) / step.value) * step.value + min.value, decimalCount)
      const nextValue = clamp(snapToStep, [min.value, max.value])

      updateValue((prevValues = []) => {
        const nextValues = getNextSortedValues(prevValues, nextValue, atIndex)
        if (hasMinStepsBetweenValues(nextValues, minStepsBetweenThumbs.value * step.value)) {
          valueIndexToChangeRef.value = nextValues.indexOf(nextValue)
          const hasChanged = String(nextValues) !== String(prevValues)
          // if (hasChanged && commit)
          //   onValueCommit(nextValues)
          return hasChanged ? nextValues : prevValues
        }
        else {
          return prevValues
        }
      })
    }

    // const SliderProvider = {
    //   setup(props, { slots }) {
    //     return () => h('div', [
    //       h('SliderProvider', {
    //         scope: props.__scopeSlider,
    //         disabled,
    //         min,
    //         max,
    //         valueIndexToChangeRef,
    //         thumbs: thumbRefs.value,
    //         values,
    //         orientation,
    //       }, slots.default()),
    //     ])
    //   },
    // }

    // const Collection = {
    //   setup(props, { slots }) {
    //     return () => h('div', [
    //       h('Collection.Provider', { scope: props.__scopeSlider }, slots.default()),
    //     ])
    //   },
    // }

    // const SliderOrientation = {
    //   setup(props, { slots }) {
    //     return () => h('div', [
    //       h('SliderOrientation', {
    //         'aria-disabled': disabled,
    //         'data-disabled': disabled ? '' : undefined,
    //         ...sliderProps,
    //         'ref': composedRefs,
    //         'onPointerDown': composeEventHandlers(sliderProps.onPointerDown, () => {
    //           if (!disabled)
    //             valuesBeforeSlideStartRef.value.current = values
    //         }),
    //         min,
    //         max,
    //         inverted,
    //         'onSlideStart': disabled ? undefined : handleSlideStart,
    //         'onSlideMove': disabled ? undefined : handleSlideMove,
    //         'onSlideEnd': disabled ? undefined : handleSlideEnd,
    //         'onHomeKeyDown': () => !disabled && updateValues(min, 0, { commit: true }),
    //         'onEndKeyDown': () => !disabled && updateValues(max, values.length - 1, { commit: true }),
    //         'onStepKeyDown': ({ event, direction: stepDirection }) => {
    //           if (!disabled) {
    //             const isPageKey = PAGE_KEYS.includes(event.key)
    //             const isSkipKey = isPageKey || (event.shiftKey && ARROW_KEYS.includes(event.key))
    //             const multiplier = isSkipKey ? 10 : 1
    //             const atIndex = valueIndexToChangeRef.value
    //             const value = values[atIndex]
    //             const stepInDirection = step * multiplier * stepDirection
    //             updateValues(value + stepInDirection, atIndex, { commit: true })
    //           }
    //         },
    //       }, slots.default()),
    //     ])
    //   },
    // }

    // const BubbleInput = {
    //   setup(props) {
    //     return () => h('div', [
    //       values.map((value, index) => h('BubbleInput', {
    //         key: index,
    //         name: name ? name + (values.length > 1 ? '[]' : '') : undefined,
    //         value,
    //       })),
    //     ])
    //   },
    // }

    // const originalReturn = () =>
    //   h('div', [
    //     h(SliderProvider, { __scopeSlider: props.__scopeSlider }, () => [
    //       h(Collection.Provider, { scope: props.__scopeSlider }, () => [
    //         h(Collection.Slot, { scope: props.__scopeSlider }, () => [
    //           h(SliderOrientation, {
    //             'aria-disabled': disabled,
    //             'data-disabled': disabled ? '' : undefined,
    //             ...sliderProps,
    //             'ref': composedRefs,
    //             'onPointerDown': composeEventHandlers(sliderProps.onPointerDown, () => {
    //               if (!disabled)
    //                 valuesBeforeSlideStartRef.value.current = values
    //             }),
    //             min,
    //             max,
    //             inverted,
    //             'onSlideStart': disabled ? undefined : handleSlideStart,
    //             'onSlideMove': disabled ? undefined : handleSlideMove,
    //             'onSlideEnd': disabled ? undefined : handleSlideEnd,
    //             'onHomeKeyDown': () => !disabled && updateValues(min, 0, { commit: true }),
    //             'onEndKeyDown': () => !disabled && updateValues(max, values.length - 1, { commit: true }),
    //             'onStepKeyDown': ({ event, direction: stepDirection }) => {
    //               if (!disabled) {
    //                 const isPageKey = PAGE_KEYS.includes(event.key)
    //                 const isSkipKey = isPageKey || (event.shiftKey && ARROW_KEYS.includes(event.key))
    //                 const multiplier = isSkipKey ? 10 : 1
    //                 const atIndex = valueIndexToChangeRef.value
    //                 const value = values[atIndex]
    //                 const stepInDirection = step * multiplier * stepDirection
    //                 updateValues(value + stepInDirection, atIndex, { commit: true })
    //               }
    //             },
    //           }, () => [
    //             isFormControl && values.map((value, index) => h(BubbleInput, {
    //               key: index,
    //               name: name ? name + (values.length > 1 ? '[]' : '') : undefined,
    //               value,
    //             })),
    //           ]),
    //         ]),
    //       ]),
    //     ]),
    //   ])

    // return originalReturn
  },
})

type _SliderProps = MergeProps<SliderProps, SliderElement>
type InstanceSliderType = InstanceTypeRef<typeof Slider, _SliderEl>

const OkuSlider = Slider as typeof Slider & (new () => { $props: _SliderProps })

export { OkuSlider }
export type { SliderProps, SliderElement, InstanceSliderType }
