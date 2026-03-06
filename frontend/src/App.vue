<script setup>
import { NConfigProvider, darkTheme } from 'naive-ui'

const themeOverrides = {
  common: {
    primaryColor: '#f5d577',
    primaryColorHover: '#ffe9a0',
    primaryColorPressed: '#b8922a',
    primaryColorSuppl: '#f5d577',
    borderRadius: '8px',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  Card: {
    color: '#12122a',
    colorModal: '#12122a',
    titleTextColor: '#f5d577',
    borderColor: 'rgba(245, 213, 119, 0.2)',
    borderRadius: '16px',
  },
  Input: {
    color: 'rgba(255,255,255,0.05)',
    colorFocus: 'rgba(255,255,255,0.08)',
    textColor: '#ffffff',
    placeholderColor: 'rgba(255,255,255,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderFocus: '1px solid rgba(245,213,119,0.5)',
    borderHover: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    caretColor: '#f5d577',
  },
  Select: {
    peers: {
      InternalSelection: {
        color: 'rgba(255,255,255,0.05)',
        colorActive: 'rgba(255,255,255,0.08)',
        textColor: '#ffffff',
        placeholderColor: 'rgba(255,255,255,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderFocus: '1px solid rgba(245,213,119,0.5)',
        borderHover: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
        arrowColor: 'rgba(255,255,255,0.4)',
      },
      InternalSelectMenu: {
        color: '#1a1a35',
        optionTextColor: '#ffffff',
        optionTextColorActive: '#f5d577',
        optionColorPending: 'rgba(245,213,119,0.1)',
        borderRadius: '8px',
      },
    },
  },
  Slider: {
    fillColor: '#f5d577',
    fillColorHover: '#ffe9a0',
    handleColor: '#f5d577',
    dotColor: '#f5d577',
    railColor: 'rgba(255,255,255,0.1)',
    railColorHover: 'rgba(255,255,255,0.15)',
  },
  Button: {
    textColorPrimary: '#000000',
    fontWeightStrong: '700',
  },
  Tabs: {
    tabTextColorBar: 'rgba(255,255,255,0.4)',
    tabTextColorActiveBar: '#f5d577',
    tabTextColorHoverBar: '#ffffff',
    barColor: '#f5d577',
    tabBorderColor: 'transparent',
    paneTextColor: '#ffffff',
  },
}
</script>

<template>
  <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
    <RouterView />
  </NConfigProvider>
</template>
