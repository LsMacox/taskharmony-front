<script setup>
import { nextTick, ref, watch } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  editId: {
    type: Number,
  },
  isDepartment: {
    type: Boolean,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'data',
])

import { genQueryObjFilter } from '@/plugins/fake-api/utils/query'

const store = useAdminGroupStore()
const isFormValid = ref(false)
const refForm = ref()

const name = ref(store.group?.name ?? '')
const description = ref(store.group?.description ?? '')
const selected = ref({})

const list = ref([])
const perpage = ref(15)
const total = ref(0)
const searchBy = ref('')
const isLoading = ref(false)
const isMenuState = ref()


watch(() => store.group, item => {
  if (item) {
    name.value = item.name
    description.value = item.description

    selected.value = item.parent_id
  }
})

const fetchList = async (page, save = true) => {
  isLoading.value = true

  const query = {
    perpage: perpage.value,
    page: page ? page : 1,
    ...genQueryObjFilter(['name', '||description'], 'like', [searchBy.value, searchBy.value]),
  }

  const { data: groups, meta: meta } = await store.fetchGroups(query, false)

  isLoading.value = false
  total.value = meta.total

  if (save) {
    list.value = groups
  }

  return {
    groups, meta,
  }
}

const loadMore = async () => {
  const start = list.value.length
  const end = start + perpage.value

  if (end < total.value) {
    const { groups } = await fetchList(Math.ceil(total.value / start), false)

    list.value = [...list.value, ...groups]
  }
}

const fetchSearch = async () => {
  if (isMenuState.value) {
    list.value = []
    await nextTick()
    await fetchList()
  }
}

const debouncedFetchSearch = useDebounceFn(fetchSearch, 300)

watch(() => searchBy.value, () => debouncedFetchSearch())

watch(() => props.isDrawerOpen, async val => {
  if (val) {
    list.value = []
    await fetchList()
    if (props.editId) {
      store.showGroup(props.editId)
    } else {
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  }
})

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('data', {
        name: name.value,
        description: description.value,
        is_department: props.isDepartment,
        parent_id: props.editId 
          ? !selected.value ? 'none' : selected.value 
          : selected.value,
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      :title="'Add/Edit ' + (isDepartment ? 'Department' : 'Group')"
      @cancel="closeNavigationDrawer"
    />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 Username -->
              <VCol cols="12">
                <AppTextField
                  v-model="name"
                  :rules="[requiredValidator]"
                  label="Name"
                  placeholder="Backend"
                />
              </VCol>

              <!-- 👉 Parent -->
              <VCol
                v-if="!isDepartment"
                cols="12"
              >
                <AppAutocomplete
                  v-model="selected"
                  v-model:search="searchBy"
                  :items="list"
                  item-title="name"
                  item-value="id"
                  label="Select Parent"
                  placeholder="Select Parent"
                  clearable
                  clear-icon="tabler-x"
                  @update:menu="(state) => isMenuState = state"
                >
                  <template #append-item>
                    <div
                      v-if="isLoading"
                      class="text-center my-2"
                    >
                      Loading...
                    </div>
                    <div
                      v-else
                      class="text-center my-2 cursor-pointer"
                      @click="loadMore"
                    >
                      Load more
                    </div>
                  </template>
                </AppAutocomplete>
              </VCol>

              <!-- 👉 Description -->
              <VCol cols="12">
                <AppTextarea
                  v-model="description"
                  rows="4"
                  label="Description"
                  placeholder="it is for transport affiliate..."
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Save
                </VBtn>
                <VBtn
                  type="reset"
                  variant="outlined"
                  color="secondary"
                  @click="closeNavigationDrawer"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
