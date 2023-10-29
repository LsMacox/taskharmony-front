import { useToast } from "vue-toast-notification"

export const useAdminWorkflowStore = defineStore('admin-workflow', () => {
  const workflows = ref([])
  const workflowsTree = ref([])
  const approvalsCount = ref(0)

  const toast = useToast()

  async function fetchWorkflows(query)
  {
    try {
      const response = await $api(`/admin/workflows`, { 
        method: 'GET', 
        query,
      })

      workflows.value = response

      return response
    } catch(err) {}
  }

  async function fetchWorkflowsTree(query)
  {
    try {
      const response = await $api(`/admin/workflows/tree`, { 
        method: 'GET', 
        query,
      })

      workflowsTree.value = response.data

      return response
    } catch(err) {}
  }

  async function storeWorkflow(data)
  {
    try {
      await $api(`/admin/workflows`, { 
        method: 'POST', 
        body: data,
      })

      toast.success('Success!')
    } catch(err) {}
  }

  async function updateWorkflow(id, data)
  {
    try {
      await $api(`/admin/workflows/${id}`, { 
        method: 'PATCH', 
        body: removeEmptyKeys(data),
      })

      toast.success('Success!')
    } catch(err) {}
  }

  async function deleteWorklow(id)
  {
    try {
      await $api(`/admin/workflows/${id}`, { 
        method: 'DELETE', 
      })

      toast.success('Workflow deleted!')
    } catch(err) {}
  }

  async function getApprovalsCount(id)
  {
    try {
      const response = await $api(`admin/workflows/${id}/approvals-count`, { 
        method: 'GET', 
      })

      approvalsCount.value = response
    } catch(err) {}
  }

  return {
    workflows,
    workflowsTree,
    fetchWorkflows,
    fetchWorkflowsTree,
    storeWorkflow,
    updateWorkflow,
    deleteWorklow,
    getApprovalsCount,
  }
})