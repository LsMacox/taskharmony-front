<script setup>
definePage({
  meta: {
    navActiveLink: 'admin-workflows',
    subject: 'Workflow',
    action: 'viewAny',
  },
})

import { genQueryObjFilter, genQueryObjFSortBy } from '@/plugins/fake-api/utils/query'
import ApproveSequenceDialog from '@/views/apps/workflows/ApproveSequenceDialog.vue'
import { paginationMeta } from '@api-utils/paginationMeta'
import { watch } from 'vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'

const router = useRouter()
const store = useAdminWorkflowStore()
const searchQuery = ref('')
const showApproveSequenceDialog = ref(false)
const approveSequenceWorkflowId = ref()
const selectedState = ref()

// Data table options
const createdAtRangeString = ref()
const perpage = ref(10)
const page = ref(1)
const sortBy = ref([])

const { workflows } = storeToRefs(store)
const total = computed(() => workflows.value?.meta?.total ?? 0)
const createdAtRange = computed(() => createdAtRangeString.value ? createdAtRangeString.value.split(' to ') : [])

// Headers
const headers = ref([
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: 'Name',
    key: 'name',
  },
  {
    title: 'Group',
    key: 'group_name',
    sortable: false,
  },
  {
    title: 'State',
    key: 'state',
  },
  {
    title: 'Moderate Status',
    key: 'status',
  },
  {
    title: 'Created at',
    key: 'created_at',
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
  },
])

watch(() => searchQuery.value, val => debouncedFetchList())

watch([
  page,
  perpage,
  sortBy,
  createdAtRangeString,
  selectedState,
], val => fetchList())

onMounted(async () => {
  await fetchList()
})

async function fetchList () {
  let queryRange = {}

  if (createdAtRange.value.length == 2) {
    queryRange['created_at[start]'] = createdAtRange.value[0]
    queryRange['created_at[end]'] = new Date(new Date(createdAtRange.value[1]).getTime() + 86400000).toISOString().split('T')[0]
  } else if (createdAtRange.value.length == 1) {
    queryRange['created_at'] = createdAtRange.value[0]
  }

  await store.fetchWorkflows({
    perpage: perpage.value,
    page: page.value,
    ...genQueryObjFilter('state', '=', selectedState.value),
    ...genQueryObjFilter(['name'], 'like', [searchQuery.value, searchQuery.value]),
    ...genQueryObjFSortBy(sortBy.value),
    ...queryRange,
  })
}

const debouncedFetchList = useDebounceFn(fetchList, 300)

const updateOptions = async options => {
  page.value = options.page
  sortBy.value = options.sortBy
}

const showEdit = id => {
  router.push(`/admin/workflows/${id}`)
}

const fetchDelete = async id => {
  await store.deleteWorkflow(id)
  fetchList()
}

const clickRow = (e, { item }) => {
  showApproveSequenceDialog.value = true
  approveSequenceWorkflowId.value = item.id
}

const updateStateWorkflow = async (id, state) => {
  await store.updateWorkflow(id, { state })
  fetchList()
}

const updateStatusWorkflow = async (id, status) => {
  await store.updateWorkflow(id, { status })
  fetchList()
}
</script>

<template>
  <section>
    <VCard
      title="Filters"
      class="mb-6"
    >
      <VCardText>
        <VRow> 
          <!-- 👉 Select department radio -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppDateTimePicker
              v-model="createdAtRangeString"
              label="Range"
              placeholder="Select date"
              :config="{ mode: 'range' }"
              class="range-picker"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedState"
              label="Select State"
              placeholder="Select State"
              :items="WORKFLOW_STATES"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <VCard>
      <VCardText class="d-flex flex-wrap py-4 gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="perpage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="perpage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 10rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search"
              density="compact"
            />
          </div>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="perpage"
        v-model:page="page"
        :items="workflows.data"
        :items-length="total"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
        @click:row="clickRow"
      >
        <template #item.status="{ item }">
          {{ getStatusFromNumber(item.status, MODERATE_STATUSES) }}
        </template>
        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click.stop="fetchDelete(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>

          <IconBtn v-if="!['approved', 'rejected'].includes(item.state)">
            <VIcon
              icon="tabler-edit"
              @click.stop="showEdit(item.id)"
            />
          </IconBtn>

          <VBtn
            icon
            variant="text"
            size="small"
            color="medium-emphasis"
          >
            <VIcon
              size="24"
              icon="tabler-dots-vertical"
            />
            <VMenu activator="parent">
              <VList>
                <template v-if="item.status === MODERATE_STATUSES.approved">
                  <VListItem
                    v-if="['returned', 'in_progress'].includes(item.state)"
                    @click="updateStateWorkflow(item.id, 'approved')"
                  >
                    <template #prepend>
                      <VIcon icon="tabler-circle-check" />
                    </template>
                    <VListItemTitle>Approve</VListItemTitle>
                  </VListItem>
                  <VListItem
                    v-if="['returned', 'in_progress'].includes(item.state)"
                    @click="updateStateWorkflow(item.id, 'rejected')"
                  >
                    <template #prepend>
                      <VIcon icon="tabler-ban" />
                    </template>
                    <VListItemTitle>Reject</VListItemTitle>
                  </VListItem>
                  <VListItem
                    v-if="['rejected', 'approved'].includes(item.state)"
                    @click="updateStateWorkflow(item.id, 'returned')"
                  >
                    <template #prepend>
                      <VIcon icon="tabler-arrow-back-up" />
                    </template>
                    <VListItemTitle>Return</VListItemTitle>
                  </VListItem>
                </template>
                <template v-else>
                  <VListItem
                    v-if="MODERATE_STATUSES.pending == item.status"
                    @click="updateStatusWorkflow(item.id, 'approved')"
                  >
                    <template #prepend>
                      <VIcon icon="tabler-circle-check" />
                    </template>
                    <VListItemTitle>Moderate approve</VListItemTitle>
                  </VListItem>
                  <VListItem
                    v-if="MODERATE_STATUSES.pending == item.status"
                    @click="updateStatusWorkflow(item.id, 'rejected')"
                  >
                    <template #prepend>
                      <VIcon icon="tabler-circle-check" />
                    </template>
                    <VListItemTitle>Moderate reject</VListItemTitle>
                  </VListItem>
                </template>
              </VList>
            </VMenu>
          </VBtn>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <!-- pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              {{ paginationMeta({ page, perpage }, total) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(total / perpage)"
              :total-visible="$vuetify.display.xs ? 1 : Math.ceil(total / perpage)"
            >
              <template #prev="slotProps">
                <VBtn
                  variant="tonal"
                  color="default"
                  v-bind="slotProps"
                  :icon="false"
                >
                  Previous
                </VBtn>
              </template>

              <template #next="slotProps">
                <VBtn
                  variant="tonal"
                  color="default"
                  v-bind="slotProps"
                  :icon="false"
                >
                  Next
                </VBtn>
              </template>
            </VPagination>
          </div>
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>
  </section>
  <ApproveSequenceDialog
    v-model="showApproveSequenceDialog"
    :workflow-id="approveSequenceWorkflowId"
  />
</template>

<style lang="scss">
.range-picker {
  .flat-picker-custom-style {
    margin-block-start: 0.5rem !important;
  }
}
</style>
