import { defineComponent, h, mergeProps } from 'vue'
import { useForwardRef } from '@oku-ui/use-composable'
import { primitiveProps } from '@oku-ui/primitive'
import { OkuRovingFocusGroupImpl } from './RovingFocusGroupImpl'
import type { RovingFocusGroupNaviteElement } from './props'
import { CollectionItemSlot, CollectionProvider, CollectionSlot, GROUP_NAME, rovingFocusGroupProps, scopedProps } from './props'

const rovingFocusGroup = defineComponent({
  name: GROUP_NAME,
  components: {
    OkuRovingFocusGroupImpl,
    CollectionProvider,
    CollectionSlot,
    CollectionItemSlot,
  },
  inheritAttrs: false,
  props: {
    ...rovingFocusGroupProps.props,
    ...scopedProps,
    ...primitiveProps,
  },
  setup(props, { slots, attrs }) {
    const forwardedRef = useForwardRef()
    return () => {
      return h(CollectionProvider, {
        scope: props.scopeOkuRovingFocusGroup,
      }, {
        default: () => h(CollectionSlot, {
          scope: props.scopeOkuRovingFocusGroup,
        }, {
          default: () => h(OkuRovingFocusGroupImpl, {
            ...mergeProps(attrs, props),
            ref: forwardedRef,
          }, slots),
        }),
      })
    }
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuRovingFocusGroup = rovingFocusGroup as typeof rovingFocusGroup &
(new () => {
  $props: RovingFocusGroupNaviteElement
})
