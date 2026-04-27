/**
 * Full-screen stack route for My Shell Collection (see PlayStack in App.js).
 */
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import ShellCollectionPanel from '../components/ocean/ShellCollectionPanel';

export default function ShellCollectionScreen() {
  const nav = useNavigation();
  const route = useRoute();
  return (
    <ShellCollectionPanel
      onClose={() => nav.goBack()}
      resumeToSessionRewards={route.params?.resumeToSessionRewards === true}
      resumeParams={route.params?.resumeParams}
    />
  );
}
