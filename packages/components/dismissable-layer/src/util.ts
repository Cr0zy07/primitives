import { useCallbackRef } from '@oku-ui/use-composable'
import { onBeforeUnmount, ref, watchEffect } from 'vue'
import { dispatchDiscreteCustomEvent } from '@oku-ui/primitive'

import type { Scope } from '@oku-ui/provide'
import { ScopePropObject } from '@oku-ui/provide'
import type {
  FocusOutsideEvent,
  PointerDownOutsideEvent,
} from './DismissableLayer'
import {
  FOCUS_OUTSIDE,
  INJECT_UPDATE,
  POINTER_DOWN_OUTSIDE,
} from './DismissableLayer'

export type ScopeDismissableLayer<T> = T & { scopeOkuDismissableLayer?: Scope }

export const scopeDismissableLayerProps = {
  scopeOkuDismissableLayer: {
    ...ScopePropObject,
  },
}

/**
 * Listens for `pointerdown` outside a subtree. We use `pointerdown` rather than `pointerup`
 * to mimic layer dismissing behaviour present in OS.
 * Returns props to pass to the node we want to check for outside events.
 */
function usePointerDownOutside(
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void,
  ownerDocument: Document = globalThis?.document,
) {
  const handlePointerDownOutside = useCallbackRef(
    onPointerDownOutside,
  ) as EventListener

  const isPointerInsideTreeRef = ref<boolean>(false)
  const handleClickRef = ref<EventListener>(() => {}) as any

  function handleAndDispatchPointerDownOutsideEvent(event: PointerEvent) {
    const eventDetail = { originalEvent: event }

    handleAndDispatchCustomEvent(
      POINTER_DOWN_OUTSIDE,
      handlePointerDownOutside,
      eventDetail,
      { discrete: true },
    )
  }

  watchEffect((onInvalidate) => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target && !isPointerInsideTreeRef.value) {
        /**
         * On touch devices, we need to wait for a click event because browsers implement
         * a ~350ms delay between the time the user stops touching the display and when the
         * browser executes events. We need to ensure we don't reactivate pointer-events within
         * this timeframe otherwise the browser may execute events that should have been prevented.
         *
         * Additionally, this also lets us deal automatically with cancellations when a click event
         * isn't raised because the page was considered scrolled/drag-scrolled, long-pressed, etc.
         *
         * This is why we also continuously remove the previous listener, because we cannot be
         * certain that it was raised, and therefore cleaned-up.
         */
        if (event.pointerType === 'touch') {
          ownerDocument.removeEventListener('click', handleClickRef.value)
          handleClickRef.value = handleAndDispatchPointerDownOutsideEvent

          ownerDocument.addEventListener('click', handleClickRef.value, {
            once: true,
          })
        }
        else {
          handleAndDispatchPointerDownOutsideEvent(event)
        }
      }
      else {
        // We need to remove the event listener in case the outside click has been canceled.
        // See: https://github.com/radix-ui/primitives/issues/2171
        ownerDocument.removeEventListener('click', handleClickRef.value)
      }
      isPointerInsideTreeRef.value = false
    }

    /**
     * if this hook executes in a component that mounts via a `pointerdown` event, the event
     * would bubble up to the document and trigger a `pointerDownOutside` event. We avoid
     * this by delaying the event listener registration on the document.
     * This is not specific, but rather how the DOM works, ie:
     * ```
     * button.addEventListener('pointerdown', () => {
     *   console.log('I will log');
     *   document.addEventListener('pointerdown', () => {
     *     console.log('I will also log');
     *   })
     * });
     */
    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener('pointerdown', handlePointerDown)
    }, 0)

    onBeforeUnmount(() => {
      clearTimeout(timerId)

      ownerDocument.removeEventListener('pointerdown', handlePointerDown)
      ownerDocument.removeEventListener('click', handleClickRef.value)
    })

    onInvalidate(() => {
      window.clearTimeout(timerId)
    })
  })

  return {
    onPointerDownCapture: () => (isPointerInsideTreeRef.value = true),
  }
}

/**
 * Listens for when focus happens outside a react subtree.
 * Returns props to pass to the root (node) of the subtree we want to check.
 */
function useFocusOutside(
  onFocusOutside?: (event: FocusOutsideEvent) => void,
  ownerDocument: Document = globalThis?.document,
) {
  const handleFocusOutside = useCallbackRef(onFocusOutside) as EventListener
  const isFocusInsideReactTreeRef = ref<boolean>(false)

  const handleFocus = (event: FocusEvent) => {
    if (event.target && !isFocusInsideReactTreeRef.value) {
      const eventDetail = { originalEvent: event }

      handleAndDispatchCustomEvent(
        FOCUS_OUTSIDE,
        handleFocusOutside,
        eventDetail,
        {
          discrete: false,
        },
      )
    }
  }

  watchEffect((onInvalidate) => {
    ownerDocument.addEventListener('focusin', handleFocus)

    onInvalidate(() => {
      ownerDocument.removeEventListener('focusin', handleFocus)
    })
  })

  return {
    onFocusCapture: () => (isFocusInsideReactTreeRef.value = true),
    onBlurCapture: () => (isFocusInsideReactTreeRef.value = false),
  }
}

function dispatchUpdate() {
  const event = new CustomEvent(INJECT_UPDATE)
  document.dispatchEvent(event)
}

function handleAndDispatchCustomEvent<
  E extends CustomEvent,
  OriginalEvent extends Event,
>(
  name: string,
  handler: ((event: E) => void) | undefined,
  detail: { originalEvent: OriginalEvent } & (E extends CustomEvent<infer D>
    ? D
    : never),
  { discrete }: { discrete: boolean },
) {
  const target = detail.originalEvent.target

  const event = new CustomEvent(name, {
    bubbles: false,
    cancelable: true,
    detail,
  })

  if (handler)
    target.addEventListener(name, handler as EventListener, { once: true })

  if (discrete)
    dispatchDiscreteCustomEvent(target, event)
  else
    target.dispatchEvent(event)
}

export {
  usePointerDownOutside,
  handleAndDispatchCustomEvent,
  useFocusOutside,
  dispatchUpdate,
}
