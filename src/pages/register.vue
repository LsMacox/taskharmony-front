<script setup>
import authV2RegisterIllustrationBorderedDark from '@images/pages/auth-v2-register-illustration-bordered-dark.png'
import authV2RegisterIllustrationBorderedLight from '@images/pages/auth-v2-register-illustration-bordered-light.png'
import authV2RegisterIllustrationDark from '@images/pages/auth-v2-register-illustration-dark.png'
import authV2RegisterIllustrationLight from '@images/pages/auth-v2-register-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { VForm } from 'vuetify/components/VForm'

const imageVariant = useGenerateImageVariant(authV2RegisterIllustrationLight, authV2RegisterIllustrationDark, authV2RegisterIllustrationBorderedLight, authV2RegisterIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const isLoading = ref(false)

const ability = useAbility()
const router = useRouter()

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const form = ref({
  name: '',
  email: '',
  password: '',
  privacyPolicies: false,
})

const refVForm = ref()

const errors = ref({
  name: undefined,
  email: undefined,
  password: undefined,
})

const isPasswordVisible = ref(false)

const register = async () => {
  try {
    isLoading.value = true

    const res = await $api('/auth/register', {
      method: 'POST',
      body: {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        // eslint-disable-next-line camelcase
        c_password: form.value.password,
      },
      onResponseError({ response }) {
        errors.value = response._data.errors
      },
    })

    const { accessToken, user, userAbilityRules } = res

    useCookie('userAbilityRules').value = userAbilityRules
    ability.update(userAbilityRules)
    useCookie('userData').value = user
    useCookie('accessToken').value = accessToken

    await nextTick(() => {
      router.push('/')
    })
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      register()
  })
}
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="441"
            :src="imageVariant"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg
          class="auth-footer-mask"
          :src="authThemeMask"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <VNodeRenderer
            :nodes="themeConfig.app.logo"
            class="mb-6"
          />
          <h5 class="text-h5 mb-1">
            Adventure starts here 🚀
          </h5>
          <p class="mb-0">
            Make your app management easy and fun!
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- Username -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  :rules="[requiredValidator]"
                  autofocus
                  label="Username"
                  placeholder="Johndoe"
                  :error-messages="errors.name"
                />
              </VCol>

              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  type="email"
                  placeholder="johndoe@email.com"
                  :error-messages="errors.email"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  :rules="[requiredValidator]"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :error-messages="errors.password"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center mt-2 mb-4">
                  <VCheckbox
                    id="privacy-policy"
                    v-model="form.privacyPolicies"
                    inline
                  />
                  <VLabel
                    for="privacy-policy"
                    style="opacity: 1;"
                  >
                    <span class="me-1">I agree to</span>
                    <a
                      href="javascript:void(0)"
                      class="text-primary"
                    >privacy policy & terms</a>
                  </VLabel>
                </div>

                <VBtn
                  block
                  type="submit"
                  :disabled="!form.privacyPolicies"
                  :loading="isLoading"
                >
                  Sign up
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-center text-base"
              >
                <span>Already have an account?</span>
                <RouterLink
                  class="text-primary ms-2"
                  :to="{ name: 'login' }"
                >
                  Sign in instead
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
