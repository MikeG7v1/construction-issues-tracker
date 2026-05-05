<script setup lang="ts">
import TopBar from './components/layout/TopBar.vue'
import SideRail from './components/layout/SideRail.vue'
import BluePrintViewer from './components/blueprint/BluePrintViewer.vue'
import IssuesDrawer from './components/issues/IssuesDrawer.vue'
import { useIssueStore } from './stores/useIssuesStore'

const store = useIssueStore()
</script>

<template>
  <v-app>
    <SideRail />
    <TopBar :title="store.currentPlan?.title ?? 'Current plan'" :stats="store.issueStats" />
    <BluePrintViewer />
    <IssuesDrawer />
  </v-app>
</template>

<style scoped></style>
