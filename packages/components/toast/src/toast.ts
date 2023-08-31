import { useControllable, useForwardRef } from '@oku-ui/use-composable'
import type { PropType } from 'vue'
import { computed, defineComponent, h, toRefs, useModel } from 'vue'
import { primitiveProps, propsOmit } from '@oku-ui/primitive'
import { OkuPresence } from '@oku-ui/presence'
import { composeEventHandlers } from '@oku-ui/utils'
import { OkuToastImpl, toastImplProps } from './toast-impl'
import type { SwipeEvent, ToastImplElement, ToastImplEmits, ToastImplIntrinsicElement, ToastImplPrivateEmits, ToastImplPrivateProps, ToastImplProps } from './toast-impl'
import { scopedToastProps } from './types'

/* -------------------------------------------------------------------------------------------------
 * Toast
 * ----------------------------------------------------------------------------------------------- */

export const TOAST_NAME = 'OkuToast'

type ToastIntrinsicElement = ToastImplIntrinsicElement
type ToastElement = ToastImplElement

interface ToastProps extends Omit<ToastImplProps, keyof ToastImplPrivateProps> {
  open?: boolean
  defaultOpen?: boolean
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true
}

export type ToastPropsEmits = {
  'update:modelValue': [value: boolean]
  openChange: [open: boolean]
} & Omit<ToastImplEmits, keyof ToastImplPrivateEmits>

const toastProps = {
  props: {
    ...toastImplProps.props,
    modelValue: {
      type: Boolean as PropType<boolean>,
      default: undefined,
    },
    open: {
      type: Boolean,
      required: false,
    },
    defaultOpen: {
      type: Boolean,
      required: false,
    },
    forceMount: {
      type: Boolean,
      default: true,
    },
  },
  emits: {
    ...propsOmit(toastImplProps.emits, ['close']),
    // eslint-disable-next-line unused-imports/no-unused-vars
    'update:modelValue': (value: boolean) => true,
    // eslint-disable-next-line unused-imports/no-unused-vars
    'openChange': (value: boolean) => true,
  },
}

const toast = defineComponent({
  name: TOAST_NAME,
  components: {
    OkuPresence,
    OkuToastImpl,
  },
  inheritAttrs: false,
  props: {
    ...toastProps.props,
    ...primitiveProps,
    ...scopedToastProps,
  },
  emits: toastProps.emits,
  setup(props, { attrs, emit, slots }) {
    const forwardedRef = useForwardRef()

    const {
      forceMount,
      open: openProp,
      defaultOpen,
    } = toRefs(props)

    const modelValue = useModel(props, 'modelValue')

    const { state, updateValue } = useControllable({
      prop: computed(() => modelValue.value ?? openProp.value),
      defaultProp: computed(() => defaultOpen.value || false),
      onChange: (open: boolean) => {
        emit('update:modelValue', open)
        emit('openChange', open)
      },
      initialValue: true,
    })

    return () =>
      h(OkuPresence, { present: computed(() => forceMount.value || state.value).value },
        {
          default: () => h(OkuToastImpl, {
            open: state.value,
            ...attrs,
            ref: forwardedRef,
            onClose: () => updateValue(false),
            onPause: () => emit('pause'),
            onResume: () => emit('resume'),
            onSwipeStart: composeEventHandlers<SwipeEvent>((event) => {
              emit('swipeStart', event)
            }, (event) => {
              const targetElement = event.currentTarget as HTMLElement
              targetElement.setAttribute('data-swipe', 'start')
            }),
            onSwipeMove: composeEventHandlers<SwipeEvent>((event) => {
              emit('swipeMove', event)
            }, (event) => {
              const { x, y } = event.detail.delta
              const targetElement = event.currentTarget as HTMLElement
              targetElement.setAttribute('data-swipe', 'move')
              targetElement.style.setProperty('--oku-toast-swipe-move-x', `${x}px`)
              targetElement.style.setProperty('--oku-toast-swipe-move-y', `${y}px`)
            }),
            onSwipeCancel: composeEventHandlers<SwipeEvent>((event) => {
              emit('swipeCancel', event)
            }, (event) => {
              const targetElement = event.currentTarget as HTMLElement
              targetElement.setAttribute('data-swipe', 'cancel')
              targetElement.style.removeProperty('--oku-toast-swipe-move-x')
              targetElement.style.removeProperty('--oku-toast-swipe-move-y')
              targetElement.style.removeProperty('--oku-toast-swipe-end-x')
              targetElement.style.removeProperty('--oku-toast-swipe-end-y')
            }),
            onSwipeEnd: composeEventHandlers<SwipeEvent>((event) => {
              emit('swipeEnd', event)
            }, (event) => {
              const { x, y } = event.detail.delta
              const targetElement = event.currentTarget as HTMLElement
              targetElement.setAttribute('data-swipe', 'end')
              targetElement.style.removeProperty('--oku-toast-swipe-move-x')
              targetElement.style.removeProperty('--oku-toast-swipe-move-y')
              targetElement.style.setProperty('--oku-toast-swipe-end-x', `${x}px`)
              targetElement.style.setProperty('--oku-toast-swipe-end-y', `${y}px`)
              updateValue(false)
            }),
          }, {
            default: () => slots.default?.(),
          }),
        },
      )
  },
})

export const OkuToast = toast as typeof toast &
(new () => { $props: Partial<ToastElement> })

export type { ToastElement, ToastProps }
