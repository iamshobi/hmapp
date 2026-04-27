import React from 'react';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { colors } from '../../theme';

/**
 * Style guide shell — white tab bar, top hairline (active tint via Navigator `tabBarActiveTintColor`).
 */
export function AppBottomTabBar(props) {
  return (
    <BottomTabBar
      {...props}
      style={[
        {
          backgroundColor: colors.white,
          borderTopColor: 'rgba(0,0,0,0.08)',
          borderTopWidth: 1,
        },
        props.style,
      ]}
    />
  );
}
