'use strict';

describe('Tutors E2E Tests:', function () {
  describe('Test tutors page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/tutors');
      expect(element.all(by.repeater('tutor in tutors')).count()).toEqual(0);
    });
  });
});
