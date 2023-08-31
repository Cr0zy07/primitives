import { defineComponent, h } from 'vue'
import type { VisuallyHiddenElement, VisuallyHiddenIntrinsicElement } from '@oku-ui/visually-hidden'
import { useForwardRef } from '@oku-ui/use-composable'
import { OkuVisuallyHidden, visuallyHiddenProps } from '@oku-ui/visually-hidden'
import { useToastProviderInject } from './toast-provider'
import { scopedToastProps } from './types'

const FOCUS_PROXY_NAME = 'OkuToastFocusProxy'

export type FocusProxyElement = VisuallyHiddenElement
export type VisuallyHiddenProps = VisuallyHiddenIntrinsicElement

export interface FocusProxyProps extends VisuallyHiddenProps {
}

export interface FocusProxyPropsEmits {
  focusFromOutsideViewport: []
}

const focusProxyProps = {
  props: {
    ...visuallyHiddenProps.props,
  },
  emits: {
    focusFromOutsideViewport: () => true,
    ...visuallyHiddenProps.emits,
  },
}

const toastFocusProxy = defineComponent({
  name: FOCUS_PROXY_NAME,
  components: {
    OkuVisuallyHidden,
  },
  inheritAttrs: false,
  props: {
    ...focusProxyProps.props,
    ...scopedToastProps,
  },
  emits: focusProxyProps.emits,
  setup(props, { attrs, emit, slots }) {
    const forwardedRef = useForwardRef()

    const inject = useToastProviderInject(FOCUS_PROXY_NAME, props.scopeOkuToast)

    return () => h(
      OkuVisuallyHidden,
      {
        'aria-hidden': true,
        'tabIndex': 0,
        'asChild': props.asChild,
        ...attrs,
        'ref': forwardedRef,
        // Avoid page scrolling when focus is on the focus proxy
        'style': { position: 'fixed' } as CSSStyleDeclaration,
        'onFocus': (event: FocusEvent) => {
          const prevFocusedElement = event.relatedTarget as HTMLElement | null
          const isFocusFromOutsideViewport = !inject.viewport.value?.contains(prevFocusedElement)
          if (isFocusFromOutsideViewport)
            emit('focusFromOutsideViewport')
        },
      },
      {
        default: () => slots.default?.(),
      },
    )
  },
})

export const OkuToastFocusProxy = toastFocusProxy as typeof toastFocusProxy &
(new () => { $props: Partial<FocusProxyElement> })
