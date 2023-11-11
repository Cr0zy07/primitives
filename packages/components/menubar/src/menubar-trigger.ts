import { defineComponent, h, mergeProps, reactive, ref, toRefs } from 'vue'
import { Primitive } from '@oku-ui/primitive'
import { reactiveOmit, useComposedRefs, useForwardRef, useListeners } from '@oku-ui/use-composable'
import { composeEventHandlers } from '@oku-ui/utils'
import { OkuMenuAnchor } from '@oku-ui/menu'
import { OkuRovingFocusGroupItem } from '@oku-ui/roving-focus'
import { CollectionItemSlot, MENUBAR_TRIGGER_NAME, menubarTriggerProps, scopedMenubarProps, useMenuScope, useMenubarInject, useMenubarMenuInject, useRovingFocusGroupScope } from './props'
import type { MenubarTriggerElement, MenubarTriggerEmits, MenubarTriggerNativeElement } from './props'

const menubarTrigger = defineComponent({
  name: MENUBAR_TRIGGER_NAME,
  components: {
    OkuMenuAnchor,
    OkuRovingFocusGroupItem,
  },
  inheritAttrs: false,
  props: {
    ...menubarTriggerProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarTriggerProps.emits,
  setup(props, { attrs, emit, slots }) {
    const {
      scopeOkuMenubar,
      disabled,
      ...triggerProps
    } = toRefs(props)

    const _other = reactive(triggerProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()
    const emits = useListeners()

    const rovingFocusGroupScope = useRovingFocusGroupScope(scopeOkuMenubar.value)
    const menuScope = useMenuScope(scopeOkuMenubar.value)
    const inject = useMenubarInject(MENUBAR_TRIGGER_NAME, scopeOkuMenubar.value)
    const menuInject = useMenubarMenuInject(MENUBAR_TRIGGER_NAME, scopeOkuMenubar.value)
    const menubarTriggerRef = ref<MenubarTriggerElement | null>(null)
    const composedRefs = useComposedRefs(forwardedRef, menubarTriggerRef, menuInject.triggerRef)
    const isFocused = ref(false)
    const open = inject.value.value === menuInject.value.value

    return () => h(CollectionItemSlot, {
      scope: scopeOkuMenubar.value,
      value: menuInject.value.value,
      disabled: disabled.value,
    }, h(OkuRovingFocusGroupItem, {
      asChild: true,
      ...rovingFocusGroupScope,
      focusable: !disabled.value,
      tabStopId: menuInject.value.value,
    }, h(OkuMenuAnchor, {
      asChild: true,
      ...menuScope,
    }, h(Primitive.button, {
      'type': 'button',
      'role': 'menuitem',
      'id': menuInject.triggerId.value,
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      'aria-controls': open ? menuInject.contentId.value : undefined,
      'data-highlighted': isFocused.value ? '' : undefined,
      'data-state': open ? 'open' : 'closed',
      'data-disabled': disabled.value ? '' : undefined,
      'disabled': disabled.value,
      ...mergeProps(attrs, otherProps, emits),
      'ref': composedRefs,
      'onPointerdown': composeEventHandlers<MenubarTriggerEmits['pointerdown'][0]>((event) => {
        emit('pointerdown', event)
      }, (event) => {
        // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
        // but not when the control key is pressed (avoiding MacOS right click)
        if (!disabled.value && event.button === 0 && event.ctrlKey === false) {
          inject.onMenuOpen(menuInject.value.value)
          // prevent trigger focusing when opening
          // this allows the content to be given focus without competition
          if (!open)
            event.preventDefault()
        }
      }),
      'onPointerenter': composeEventHandlers<MenubarTriggerEmits['pointerenter'][0]>((event) => {
        emit('pointerenter', event)
      }, () => {
        const menubarOpen = Boolean(inject.value.value)
        if (menubarOpen && !open) {
          inject.onMenuOpen(menuInject.value.value)
          menubarTriggerRef.value?.focus()
        }
      }),
      'onKeydown': composeEventHandlers<MenubarTriggerEmits['keydown'][0]>((event) => {
        emit('keydown', event)
      }, (event) => {
        if (disabled.value)
          return
        if (['Enter', ' '].includes(event.key))
          inject.onMenuToggle(menuInject.value.value)
        if (event.key === 'ArrowDown')
          inject.onMenuOpen(menuInject.value.value)
        // prevent keydown from scrolling window / first focused item to execute
        // that keydown (inadvertently closing the menu)
        if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
          menuInject.wasKeyboardTriggerOpenRef.value = true
          event.preventDefault()
        }
      }),
      'onFocus': composeEventHandlers<MenubarTriggerEmits['focus'][0]>((event) => {
        emit('focus', event)
      }, () => isFocused.value = true),
      'onBlur': composeEventHandlers<MenubarTriggerEmits['blur'][0]>((event) => {
        emit('blur', event)
      }, () => isFocused.value = false),
    }, slots))))
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarTrigger = menubarTrigger as typeof menubarTrigger &
(new () => { $props: MenubarTriggerNativeElement })
