import { defineComponent, h, mergeProps, reactive, ref, toRefs } from 'vue'
import { reactiveOmit, useForwardRef, useListeners } from '@oku-ui/use-composable'
import { OkuMenuContent } from '@oku-ui/menu'
import { composeEventHandlers } from '@oku-ui/utils'
import type { MenubarContentEmits } from './props'
import { MENUBAR_CONTENT_NAME, menubarContentProps, scopedMenubarProps, useCollection, useMenuScope, useMenubarInject, useMenubarMenuInject } from './props'
import { wrapArray } from './utils'

const menubarContent = defineComponent({
  name: MENUBAR_CONTENT_NAME,
  components: {
    OkuMenuContent,
  },
  inheritAttrs: false,
  props: {
    ...menubarContentProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarContentProps.emits,
  setup(props, { attrs, emit, slots }) {
    const {
      scopeOkuMenubar,
      align,
      ...contentProps
    } = toRefs(props)

    const _other = reactive(contentProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()
    const emits = useListeners()

    const menuScope = useMenuScope(scopeOkuMenubar.value)
    const inject = useMenubarInject(MENUBAR_CONTENT_NAME, scopeOkuMenubar.value)
    const menuInject = useMenubarMenuInject(MENUBAR_CONTENT_NAME, scopeOkuMenubar.value)
    const getItems = useCollection(scopeOkuMenubar.value)
    const hasInteractedOutsideRef = ref(false)

    return () => h(OkuMenuContent, {
      'id': menuInject.contentId.value,
      'aria-labelledby': menuInject.triggerId.value,
      'data-oku-menubar-content': '',
      ...menuScope,
      ...mergeProps(attrs, otherProps, emits),
      'ref': forwardedRef,
      'align': align.value,
      'onCloseAutoFocus': composeEventHandlers<MenubarContentEmits['closeAutoFocus'][0]>((event) => {
        emit('closeAutoFocus', event)
      }, (event) => {
        const menubarOpen = Boolean(inject.value)
        if (!menubarOpen && !hasInteractedOutsideRef.value)
          menuInject.triggerRef.value?.focus()

        hasInteractedOutsideRef.value = false
        // Always prevent auto focus because we either focus manually or want user agent focus
        event.preventDefault()
      }),
      'onFocusOutside': composeEventHandlers(props.onFocusOutside, (event) => {
        const target = event.target as HTMLElement
        const isMenubarTrigger = getItems().some(item => item.ref.value?.contains(target))
        if (isMenubarTrigger)
          event.preventDefault()
      }),
      'onInteractOutside': composeEventHandlers<MenubarContentEmits['interactOutside'][0]>((event) => {
        emit('interactOutside', event)
      }, () => hasInteractedOutsideRef.value = true),
      'onEntryFocus': (event) => {
        if (!menuInject.wasKeyboardTriggerOpenRef.value)
          event.preventDefault()
      },
      'onKeydown': composeEventHandlers<MenubarContentEmits['keydown'][0]>((event) => {
        emit('keydown', event)
      }, (event) => {
        if (['ArrowRight', 'ArrowLeft'].includes(event.key)) {
          const target = event.target as HTMLElement
          const targetIsSubTrigger = target.hasAttribute('data-oku-menubar-subtrigger')
          const isKeyDownInsideSubMenu
            = target.closest('[data-oku-menubar-content]') !== event.currentTarget

          const prevMenuKey = inject.dir.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
          const isPrevKey = prevMenuKey === event.key
          const isNextKey = !isPrevKey

          // Prevent navigation when we're opening a submenu
          if (isNextKey && targetIsSubTrigger)
            return
          // or we're inside a submenu and are moving backwards to close it
          if (isKeyDownInsideSubMenu && isPrevKey)
            return

          const items = getItems().filter(item => !item.disabled)
          let candidateValues = items.map(item => item.value)
          if (isPrevKey)
            candidateValues.reverse()

          const currentIndex = candidateValues.indexOf(menuInject.value.value)

          candidateValues = inject.loop.value
            ? wrapArray(candidateValues, currentIndex + 1)
            : candidateValues.slice(currentIndex + 1)

          const [nextValue] = candidateValues
          if (nextValue)
            inject.onMenuOpen(nextValue)
        }
      }, { checkForDefaultPrevented: false }),
      'style': {
        ...attrs.style as any,
        // re-namespace exposed content custom properties
        ...{
          '--oku-menubar-content-transform-origin': 'var(--oku-popper-transform-origin)',
          '--oku-menubar-content-available-width': 'var(--oku-popper-available-width)',
          '--oku-menubar-content-available-height': 'var(--oku-popper-available-height)',
          '--oku-menubar-trigger-width': 'var(--oku-popper-anchor-width)',
          '--oku-menubar-trigger-height': 'var(--oku-popper-anchor-height)',
        },
      },
    }, slots)
  },
})

export const OkuMenubarContent = menubarContent
