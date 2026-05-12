import React from 'react';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { colors } from '../../theme';

export function AppBottomTabBar(props) {
  return (
    <BottomTabBar
      {...props}
      style={[
        {
          backgroundColor: '#FAFAFA',
          borderTopColor: 'rgba(107,45,139,0.14)',
          borderTopWidth: 1,
          paddingTop: 4,
          paddingBottom: 2,
          minHeight: 66,
        },
        props.style,
      ]}
    />
  );
}
