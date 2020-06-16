import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import upload from "@/components//public/upload.vue";

describe("upload.vue", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message";
    const wrapper = shallowMount(upload, {
      propsData: { msg }
    });
    expect(wrapper.text()).to.include(msg);
  });
});
